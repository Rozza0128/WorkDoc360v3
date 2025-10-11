import Stripe from 'stripe';
import { storage } from '../storage';
import { automatedSubdomainService } from './domainManager';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

export async function finalizeCheckoutSession(sessionId: string): Promise<{ success: boolean; companyId?: number; message?: string }> {
    if (!sessionId) return { success: false, message: 'session_id required' };

    try {
        // Try to load session from Stripe if configured
        let session: any = null;
        if (stripe) {
            session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['customer', 'subscription'] });
        }

        // If session includes metadata.companyId use that, otherwise fail
        const metadata = session?.metadata || {};
        const companyId = metadata.companyId ? parseInt(metadata.companyId) : null;

        if (!companyId) {
            return { success: false, message: 'No companyId found in session metadata' };
        }

        // Idempotency: check if company already has stripeSessionId recorded
        const company = await storage.getCompany(companyId);
        if (!company) return { success: false, message: 'Company not found' };

        if ((company as any).stripeSessionId === sessionId) {
            return { success: true, companyId, message: 'Already finalized' };
        }

        // Verify payment status if we have session info
        const paid = stripe ? (
            session.payment_status === 'paid' || session.status === 'complete'
        ) : true; // If Stripe not configured, assume success in dev

        if (!paid) {
            return { success: false, message: 'Session not paid yet' };
        }

        // Assign slug if missing
        let slug = company.companySlug;
        if (!slug) {
            // generate fallback slug from company name
            slug = company.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '')
                .substring(0, 20);

            // ensure uniqueness
            let candidate = slug;
            let i = 1;
            while (true) {
                const existing = await storage.getCompanyBySlug(candidate);
                if (!existing || existing.id === companyId) break;
                candidate = `${slug}-${i}`;
                i++;
            }
            slug = candidate;

            await storage.updateCompany(companyId, { companySlug: slug });
        }

        // If Stripe returned customer/subscription info, persist it for later reconciliation
        if (stripe && session) {
            try {
                const updates: any = {};
                if (session.customer) updates.stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
                if (session.subscription) updates.stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
                if (session.payment_status) updates.subscriptionStatus = session.payment_status === 'paid' ? 'active' : session.payment_status;
                if (session.expires_at) updates.currentPeriodEnd = new Date(session.expires_at * 1000);
                // lastPaidAt isn't directly present on session; check subscription object
                if (session.subscription && session.subscription.current_period_end) {
                    updates.currentPeriodEnd = new Date(session.subscription.current_period_end * 1000);
                }
                // Always store the session id for idempotency
                updates.stripeSessionId = sessionId;

                await storage.updateCompany(companyId, updates);
            } catch (err) {
                console.error('Failed to persist Stripe metadata on company:', err);
            }
        } else {
            // If Stripe not configured, still persist session id for local testing
            try {
                await storage.updateCompany(companyId, { stripeSessionId: sessionId });
            } catch (err) {
                console.error('Failed to persist session id for company:', err);
            }
        }

        // Create DNS/subdomain using existing automation (use company name so the
        // automated service can generate/ensure the slug correctly)
        try {
            await automatedSubdomainService.createCompanySubdomain(companyId, company.name);
        } catch (err) {
            console.error('Failed to create subdomain during finalize:', err);
        }

        return { success: true, companyId, message: 'Finalized' };
    } catch (error) {
        console.error('Error in finalizeCheckoutSession:', error);
        return { success: false, message: (error as any)?.message || 'Unknown error' };
    }
}
