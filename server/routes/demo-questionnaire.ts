import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { demoQuestionnaires, demoWebsites, insertDemoQuestionnaireSchema } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// AI-powered demo website generator service
class DemoWebsiteGenerator {
  private generateBusinessContent(questionnaire: any) {
    const { businessName, tradeType, businessDescription, serviceAreas, mainServices } = questionnaire;
    
    // Generate hero section content
    const heroSection = {
      headline: `Professional ${tradeType} Services - ${businessName}`,
      subheadline: businessDescription || `Expert ${tradeType.toLowerCase()} serving ${serviceAreas.slice(0, 2).join(' & ')} with quality workmanship and reliable service.`,
      ctaText: "Get Your Free Quote Today",
      backgroundImage: this.getTradeSpecificImage(tradeType)
    };

    // Generate about section
    const aboutSection = {
      title: "About " + businessName,
      content: `${businessName} is a ${questionnaire.businessType === 'sole_trader' ? 'trusted sole trader' : 'established company'} specialising in ${tradeType.toLowerCase()}. ${questionnaire.yearsInBusiness ? `With ${questionnaire.yearsInBusiness} years of experience` : 'With extensive experience'} in the construction industry, we pride ourselves on delivering quality workmanship and exceptional customer service.`,
      values: [
        "Quality workmanship guaranteed",
        "Fully insured and certified",
        "Competitive pricing",
        "Free no-obligation quotes",
        "Local family business"
      ]
    };

    // Generate services section based on trade type
    const servicesSection = {
      title: "Our Services",
      services: this.generateTradeSpecificServices(tradeType, mainServices)
    };

    // Generate testimonials section
    const testimonialsSection = {
      title: "What Our Customers Say",
      testimonials: this.generateTradeSpecificTestimonials(tradeType, businessName)
    };

    // Generate contact section
    const contactSection = {
      title: "Get In Touch",
      phone: questionnaire.phone || "01234 567890",
      email: questionnaire.email,
      address: questionnaire.address || `Serving ${serviceAreas.slice(0, 3).join(', ')}`,
      serviceAreas: serviceAreas,
      ctaText: "Call for your free quote"
    };

    return {
      heroSection,
      aboutSection,
      servicesSection,
      testimonialsSection,
      contactSection
    };
  }

  private getTradeSpecificImage(tradeType: string): string {
    const imageMap: Record<string, string> = {
      "Scaffolders (CISRS)": "scaffolding-construction-site.jpg",
      "Plasterers": "plastering-interior-wall.jpg",
      "General Building Contractors": "construction-team-site.jpg",
      "Bricklayers": "bricklaying-construction.jpg",
      "Carpenters & Joiners": "carpentry-woodwork.jpg",
      "Roofers": "roofing-installation.jpg",
      "Electricians (18th Edition)": "electrical-installation.jpg",
      "Plumbers (Gas Safe)": "plumbing-installation.jpg",
      "Painters & Decorators": "painting-interior.jpg",
      "Flooring Specialists": "flooring-installation.jpg",
      "Window Fitters (FENSA)": "window-installation.jpg"
    };
    
    return imageMap[tradeType] || "construction-generic.jpg";
  }

  private generateTradeSpecificServices(tradeType: string, mainServices: string[]): any[] {
    const serviceMap: Record<string, string[]> = {
      "Scaffolders (CISRS)": [
        "Commercial scaffolding erection",
        "Residential scaffolding hire", 
        "Temporary roof systems",
        "Access towers and platforms",
        "Safety barriers and hoarding",
        "Scaffolding inspections"
      ],
      "Plasterers": [
        "Internal wall plastering",
        "Ceiling repairs and renovation",
        "Artex removal and skimming",
        "Lime plaster restoration",
        "Rendering and external coatings",
        "Damp proofing solutions"
      ],
      "General Building Contractors": [
        "House extensions and conversions",
        "Kitchen and bathroom installations",
        "Roofing and guttering services",
        "Groundworks and foundations",
        "Planning and building regulations",
        "Project management"
      ],
      "Bricklayers": [
        "New build construction",
        "Extension and garden walls",
        "Brick repairs and repointing",
        "Chimney repairs and rebuilds",
        "Boundary walls and fencing",
        "Paving and patios"
      ],
      "Electricians (18th Edition)": [
        "Electrical installations",
        "Consumer unit upgrades",
        "PAT testing services",
        "Emergency electrical repairs",
        "LED lighting installations",
        "EV charging point installation"
      ]
    };

    const services = serviceMap[tradeType] || mainServices;
    
    return services.map((service, index) => ({
      title: service,
      description: `Professional ${service.toLowerCase()} with full insurance and certification.`,
      icon: `service-icon-${index + 1}.svg`
    }));
  }

  private generateTradeSpecificTestimonials(tradeType: string, businessName: string): any[] {
    const testimonialTemplates = [
      {
        name: "Sarah Johnson",
        location: "Hertfordshire",
        rating: 5,
        text: `${businessName} did an excellent job on our project. Professional, reliable, and great value for money. Highly recommended!`
      },
      {
        name: "Mike Thompson", 
        location: "Essex",
        rating: 5,
        text: `Outstanding service from start to finish. The team was punctual, tidy, and the quality of work exceeded our expectations.`
      },
      {
        name: "Emma Davis",
        location: "Kent",
        rating: 5,
        text: `We've used ${businessName} twice now and both times they delivered exactly what was promised. Trustworthy and skilled tradespeople.`
      }
    ];

    return testimonialTemplates;
  }

  private generateWebsiteHTML(content: any, questionnaire: any): string {
    const { heroSection, aboutSection, servicesSection, testimonialsSection, contactSection } = content;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${questionnaire.businessName} - ${questionnaire.tradeType}</title>
  <meta name="description" content="Professional ${questionnaire.tradeType} services in ${questionnaire.serviceAreas.join(', ')}. Get your free quote today.">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    
    /* Hero Section */
    .hero { 
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white; padding: 100px 0; text-align: center; 
    }
    .hero h1 { font-size: 3.5rem; margin-bottom: 1rem; font-weight: 700; }
    .hero p { font-size: 1.3rem; margin-bottom: 2rem; opacity: 0.9; }
    .cta-button { 
      background: white; color: #f97316; padding: 15px 40px; 
      border: none; border-radius: 50px; font-size: 1.1rem; font-weight: 600;
      cursor: pointer; text-decoration: none; display: inline-block;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: transform 0.3s;
    }
    .cta-button:hover { transform: translateY(-2px); }
    
    /* Navigation */
    nav { background: #1f2937; padding: 1rem 0; position: sticky; top: 0; z-index: 100; }
    nav ul { list-style: none; display: flex; justify-content: center; }
    nav a { color: white; text-decoration: none; margin: 0 2rem; font-weight: 500; }
    nav a:hover { color: #f97316; }
    
    /* Sections */
    .section { padding: 80px 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
    .section h2 { text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: #1f2937; }
    
    /* About Section */
    .about { background: #f8fafc; }
    .about-content { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
    .values { list-style: none; margin-top: 2rem; }
    .values li { padding: 0.5rem 0; }
    .values li:before { content: '✓'; color: #f97316; font-weight: bold; margin-right: 1rem; }
    
    /* Services Section */
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
    .service-card { 
      background: white; padding: 2rem; border-radius: 10px; text-align: center;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1); transition: transform 0.3s;
    }
    .service-card:hover { transform: translateY(-5px); }
    .service-card i { font-size: 3rem; color: #f97316; margin-bottom: 1rem; }
    
    /* Testimonials */
    .testimonials { background: #f8fafc; }
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
    .testimonial { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
    .stars { color: #fbbf24; margin-bottom: 1rem; }
    .testimonial-author { margin-top: 1rem; font-weight: 600; color: #1f2937; }
    
    /* Contact Section */
    .contact { background: #1f2937; color: white; }
    .contact-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; text-align: center; }
    .contact-item i { font-size: 2rem; color: #f97316; margin-bottom: 1rem; }
    
    /* Footer */
    footer { background: #111827; color: white; text-align: center; padding: 2rem 0; }
    
    /* Responsive */
    @media (max-width: 768px) {
      .hero h1 { font-size: 2.5rem; }
      .about-content { grid-template-columns: 1fr; }
      nav ul { flex-wrap: wrap; }
      nav a { margin: 0.5rem 1rem; }
    }
  </style>
</head>
<body>
  <!-- Navigation -->
  <nav>
    <ul>
      <li><a href="#home">Home</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#services">Services</a></li>  
      <li><a href="#testimonials">Reviews</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
  </nav>

  <!-- Hero Section -->
  <section id="home" class="hero">
    <div class="container">
      <h1>${heroSection.headline}</h1>
      <p>${heroSection.subheadline}</p>
      <a href="#contact" class="cta-button">${heroSection.ctaText}</a>
    </div>
  </section>

  <!-- About Section -->
  <section id="about" class="section about">
    <div class="container">
      <h2>${aboutSection.title}</h2>
      <div class="about-content">
        <div>
          <p style="font-size: 1.1rem; line-height: 1.8;">${aboutSection.content}</p>
          <ul class="values">
            ${aboutSection.values.map((value: string) => `<li>${value}</li>`).join('')}
          </ul>
        </div>
        <div style="text-align: center;">
          <i class="fas fa-hard-hat" style="font-size: 8rem; color: #f97316; opacity: 0.1;"></i>
        </div>
      </div>
    </div>
  </section>

  <!-- Services Section -->
  <section id="services" class="section">
    <div class="container">
      <h2>${servicesSection.title}</h2>
      <div class="services-grid">
        ${servicesSection.services.map((service: any, index: number) => `
          <div class="service-card">
            <i class="fas fa-tools"></i>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Testimonials Section -->
  <section id="testimonials" class="section testimonials">
    <div class="container">
      <h2>${testimonialsSection.title}</h2>
      <div class="testimonials-grid">
        ${testimonialsSection.testimonials.map((testimonial: any) => `
          <div class="testimonial">
            <div class="stars">${'★'.repeat(testimonial.rating)}</div>
            <p>"${testimonial.text}"</p>
            <div class="testimonial-author">${testimonial.name} - ${testimonial.location}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Contact Section -->
  <section id="contact" class="section contact">
    <div class="container">
      <h2>${contactSection.title}</h2>
      <div class="contact-info">
        <div class="contact-item">
          <i class="fas fa-phone"></i>
          <h3>Call Us</h3>
          <p>${contactSection.phone}</p>
        </div>
        <div class="contact-item">
          <i class="fas fa-envelope"></i>
          <h3>Email Us</h3>
          <p>${contactSection.email}</p>
        </div>
        <div class="contact-item">
          <i class="fas fa-map-marker-alt"></i>
          <h3>Service Areas</h3>
          <p>${contactSection.serviceAreas.slice(0, 3).join(', ')}</p>
        </div>
      </div>
      <div style="text-align: center; margin-top: 3rem;">
        <a href="tel:${contactSection.phone}" class="cta-button">${contactSection.ctaText}</a>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="container">
      <p>&copy; 2025 ${questionnaire.businessName}. All rights reserved.</p>
      <p style="margin-top: 0.5rem; opacity: 0.7;">Professional ${questionnaire.tradeType} Services</p>
    </div>
  </footer>

  <script>
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
  </script>
</body>
</html>`;
  }

  async generateDemoWebsite(questionnaire: any): Promise<string> {
    // Generate content based on questionnaire
    const content = this.generateBusinessContent(questionnaire);
    
    // Generate HTML
    const websiteHtml = this.generateWebsiteHTML(content, questionnaire);
    
    // Create unique demo URL
    const demoId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const demoUrl = `https://workdoc360-demo-${demoId}.replit.app`;
    
    // Save to database
    const [website] = await db.insert(demoWebsites).values({
      questionnaireId: questionnaire.id,
      uniqueId: demoId,
      websiteHtml,
      websiteCss: "", // CSS is inline for simplicity
      websiteJs: "", // JS is inline for simplicity
      heroSection: content.heroSection,
      aboutSection: content.aboutSection,
      servicesSection: content.servicesSection,
      testimonialsSection: content.testimonialsSection,
      contactSection: content.contactSection,
      title: `${questionnaire.businessName} - ${questionnaire.tradeType}`,
      description: `Professional ${questionnaire.tradeType} services in ${questionnaire.serviceAreas.join(', ')}`,
      keywords: [questionnaire.tradeType, questionnaire.businessName, ...questionnaire.serviceAreas]
    }).returning();

    return demoUrl;
  }
}

// Submit demo questionnaire
router.post("/", async (req, res) => {
  try {
    const validatedData = insertDemoQuestionnaireSchema.parse(req.body);
    
    // Save questionnaire
    const [questionnaire] = await db.insert(demoQuestionnaires).values(validatedData).returning();
    
    // Generate demo website
    const generator = new DemoWebsiteGenerator();
    const demoUrl = await generator.generateDemoWebsite(questionnaire);
    
    // Update questionnaire with demo URL
    await db
      .update(demoQuestionnaires)
      .set({ 
        demoGenerated: true, 
        demoUrl: demoUrl,
        updatedAt: new Date()
      })
      .where(eq(demoQuestionnaires.id, questionnaire.id));
    
    res.json({ 
      success: true, 
      demoUrl,
      questionnaireId: questionnaire.id
    });
    
  } catch (error) {
    console.error("Error processing demo questionnaire:", error);
    res.status(400).json({ error: "Invalid questionnaire data" });
  }
});

// Get demo website by ID
router.get("/demo/:demoId", async (req, res) => {
  try {
    const { demoId } = req.params;
    
    const [website] = await db
      .select()
      .from(demoWebsites)
      .where(eq(demoWebsites.uniqueId, demoId));
    
    if (!website) {
      return res.status(404).send("Demo website not found");
    }
    
    // Update view count
    await db
      .update(demoWebsites)
      .set({ 
        viewCount: (website.viewCount || 0) + 1,
        lastViewed: new Date()
      })
      .where(eq(demoWebsites.id, website.id));
    
    // Serve the HTML directly
    res.send(website.websiteHtml);
    
  } catch (error) {
    console.error("Error serving demo website:", error);
    res.status(500).send("Error loading demo website");
  }
});

export default router;