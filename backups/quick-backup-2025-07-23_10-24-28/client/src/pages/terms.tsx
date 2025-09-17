import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <CardHeader className="bg-slate-900 text-white">
            <CardTitle className="text-2xl">Terms and Conditions & End User Licence Agreement</CardTitle>
            <p className="text-slate-300">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">1. Introduction and Acceptance</h2>
              <p className="text-slate-700 mb-4">
                These Terms and Conditions ("Terms") constitute a legally binding contract between you ("User", "Customer", "You") 
                and WorkDoc360 Limited, a company incorporated in England and Wales ("WorkDoc360", "Company", "We", "Us") regarding your use of the WorkDoc360 platform, 
                software, services, and all related materials (collectively, the "Service").
              </p>
              <p className="text-slate-700 font-semibold">
                BY ACCESSING OR USING OUR SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND 
                BY THESE TERMS IN THEIR ENTIRETY. IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT USE OUR SERVICE.
              </p>
            </section>

            <Separator />

            {/* Disclaimer of Warranties */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">2. Disclaimer of Warranties</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-semibold">IMPORTANT LEGAL NOTICE</p>
              </div>
              <p className="text-slate-700 mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, 
                IMPLIED, STATUTORY, OR OTHERWISE. TO THE FULLEST EXTENT PERMITTED BY ENGLISH LAW, WORKDOC360 EXPRESSLY EXCLUDES ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>CONDITIONS OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT</li>
                <li>CONDITIONS THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE</li>
                <li>WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF ANY CONTENT</li>
                <li>CONDITIONS THAT THE SERVICE WILL MEET YOUR REQUIREMENTS OR EXPECTATIONS</li>
                <li>WARRANTIES REGARDING COMPLIANCE WITH ANY LAWS, REGULATIONS, OR INDUSTRY STANDARDS</li>
              </ul>
              <p className="text-slate-700 font-semibold mt-4">
                NOTHING IN THESE TERMS EXCLUDES OR LIMITS OUR LIABILITY FOR DEATH OR PERSONAL INJURY CAUSED BY OUR NEGLIGENCE, 
                FRAUD OR FRAUDULENT MISREPRESENTATION, OR ANY OTHER LIABILITY THAT CANNOT BE EXCLUDED UNDER ENGLISH LAW.
              </p>
            </section>

            <Separator />

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. Limitation of Liability</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-amber-800 font-semibold">ABSOLUTE LIABILITY EXCLUSION</p>
              </div>
              <p className="text-slate-700 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY ENGLISH LAW, WORKDOC360 SHALL NOT BE LIABLE FOR ANY:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</strong></li>
                <li><strong>LOSS OF PROFITS, REVENUE, DATA, OR USE</strong></li>
                <li><strong>BUSINESS INTERRUPTION OR LOSS OF BUSINESS OPPORTUNITIES</strong></li>
                <li><strong>REGULATORY FINES, PENALTIES, OR SANCTIONS</strong></li>
                <li><strong>LEGAL COSTS, COURT PROCEEDINGS, OR SETTLEMENT AMOUNTS</strong></li>
                <li><strong>PERSONAL INJURY, PROPERTY DAMAGE, OR DEATH</strong></li>
                <li><strong>COMPLIANCE FAILURES OR REGULATORY VIOLATIONS</strong></li>
                <li><strong>ERRORS IN AI-GENERATED CONTENT OR DOCUMENTS</strong></li>
              </ul>
              <p className="text-slate-700 font-semibold">
                THIS LIMITATION APPLIES REGARDLESS OF THE LEGAL BASIS (CONTRACT, TORT, NEGLIGENCE, 
                BREACH OF STATUTORY DUTY, OR OTHERWISE) AND EVEN IF WORKDOC360 HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH LOSS.
              </p>
            </section>

            <Separator />

            {/* Professional Responsibility */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">4. Professional Responsibility and AI Content</h2>
              <p className="text-slate-700 mb-4">
                <strong>YOU ACKNOWLEDGE AND AGREE THAT:</strong>
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>All AI-generated documents are provided for informational purposes only and do not constitute professional advice</li>
                <li>You remain solely responsible for reviewing, verifying, and validating all generated content</li>
                <li>WorkDoc360 is not a substitute for qualified professional consultants, legal advisors, or compliance experts</li>
                <li>You must engage appropriate professionals for legal, regulatory, and compliance matters</li>
                <li>All documents must be reviewed by qualified personnel before implementation or submission</li>
                <li>You are responsible for ensuring compliance with all applicable laws, regulations, and industry standards</li>
                <li>WorkDoc360 makes no representations regarding regulatory compliance or legal sufficiency</li>
              </ul>
            </section>

            <Separator />

            {/* Indemnification */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">5. Indemnity</h2>
              <p className="text-slate-700 mb-4">
                YOU AGREE TO INDEMNIFY AND HOLD HARMLESS WORKDOC360, ITS OFFICERS, DIRECTORS, EMPLOYEES, 
                AGENTS, AND SUCCESSORS FROM AND AGAINST ANY AND ALL CLAIMS, DAMAGES, LIABILITIES, 
                COSTS, AND EXPENSES (INCLUDING REASONABLE LEGAL FEES AND COSTS) ARISING FROM OR RELATED TO:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Your use of the Service</li>
                <li>Your breach of these Terms</li>
                <li>Your breach of any applicable laws or regulations</li>
                <li>Any content you submit or generate using the Service</li>
                <li>Any third-party claims arising from your use of generated documents</li>
                <li>Regulatory breaches or compliance failures</li>
                <li>Workplace accidents, injuries, or safety incidents</li>
                <li>Any negligent or wrongful acts or omissions</li>
              </ul>
            </section>

            <Separator />

            {/* Construction Industry Specific Disclaimers */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">6. Construction Industry Specific Disclaimers</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 font-semibold">HEALTH & SAFETY COMPLIANCE DISCLAIMER</p>
              </div>
              <p className="text-slate-700 mb-4">
                <strong>CONSTRUCTION SITES ARE INHERENTLY DANGEROUS.</strong> WorkDoc360 provides document generation 
                tools only and accepts no responsibility for:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Health and safety compliance or risk management</li>
                <li>CDM 2015 Regulations or Building Regulations compliance</li>
                <li>CSCS card validity or certification requirements</li>
                <li>HSE reporting obligations or incident management</li>
                <li>Method statement accuracy or risk assessment completeness</li>
                <li>Site-specific hazards or safety procedures</li>
                <li>Insurance compliance or coverage adequacy</li>
                <li>Quality management or ISO 9001 certification</li>
                <li>Subcontractor competence or qualification verification</li>
              </ul>
            </section>

            <Separator />

            {/* Limitation of Damages */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">7. Maximum Liability Cap</h2>
              <p className="text-slate-700 mb-4">
                TO THE EXTENT THAT LIABILITY CANNOT BE EXCLUDED UNDER ENGLISH LAW, WORKDOC360'S TOTAL LIABILITY TO YOU 
                FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE TOTAL AMOUNT 
                PAID BY YOU TO WORKDOC360 IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR £100, WHICHEVER IS LESS.
              </p>
            </section>

            <Separator />

            {/* Governing Law */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">8. Governing Law and Jurisdiction</h2>
              <p className="text-slate-700">
                These Terms are governed by the laws of England and Wales. Any disputes shall be subject to 
                the exclusive jurisdiction of the courts of England and Wales. The Vienna Convention on 
                Contracts for the International Sale of Goods does not apply.
              </p>
            </section>

            <Separator />

            {/* Severability */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">9. Severability and Survival</h2>
              <p className="text-slate-700">
                If any provision of these Terms is found to be unenforceable, the remaining provisions shall 
                remain in full force and effect. The limitation of liability, disclaimer of warranties, and 
                indemnity provisions shall survive termination of your use of the Service.
              </p>
            </section>

            <Separator />

            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">10. Contact Information</h2>
              <p className="text-slate-700">
                For questions regarding these Terms, please contact us at:
                <br />
                <strong>Email:</strong> legal@workdoc360.com
                <br />
                <strong>Address:</strong> WorkDoc360 Limited, United Kingdom
              </p>
            </section>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}