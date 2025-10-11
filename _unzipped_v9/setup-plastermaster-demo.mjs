/**
 * Set up Plaster Master Ltd demo company in the database
 */

import pkg from 'pg';
const { Client } = pkg;

async function setupPlasterMasterDemo() {
  console.log('🏗️ Setting up Plaster Master Ltd demo company...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    
    // Check if company already exists
    const existingCheck = await client.query(
      'SELECT id FROM companies WHERE company_slug = $1',
      ['plastermaster']
    );
    
    if (existingCheck.rows.length > 0) {
      console.log('✅ Plaster Master Ltd already exists in database');
      console.log(`Company ID: ${existingCheck.rows[0].id}`);
      return existingCheck.rows[0].id;
    }
    
    // Create Plaster Master Ltd company
    const companyResult = await client.query(`
      INSERT INTO companies (
        name,
        company_slug,
        business_type,
        trade_type,
        phone,
        address,
        postcode,
        logo_url,
        owner_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) RETURNING id
    `, [
      'Plaster Master Ltd',
      'plastermaster',
      'limited_company',
      'plastering',
      '+44 20 7123 4567',
      '123 Builders Avenue, Industrial Estate, London, Greater London',
      'SW1A 1AA',
      null,
      'plaster_admin_demo'
    ]);
    
    const companyId = companyResult.rows[0].id;
    console.log(`✅ Created Plaster Master Ltd - Company ID: ${companyId}`);
    
    // Create demo admin user
    const userResult = await client.query(`
      INSERT INTO users (
        id,
        email,
        password,
        first_name,
        last_name,
        email_verified,
        selected_plan,
        plan_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      ) ON CONFLICT (email) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name
      RETURNING id
    `, [
      `plaster_admin_${Date.now()}`,
      'admin@plastermaster.co.uk',
      '$2b$10$encrypted.password.hash.example', // Demo password hash
      'Mike',
      'Thompson',
      true,
      'professional',
      'active'
    ]);
    
    const userId = userResult.rows[0].id;
    console.log(`✅ Created admin user: ${userId}`);
    
    // Link user to company
    await client.query(`
      INSERT INTO company_users (company_id, user_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (company_id, user_id) DO NOTHING
    `, [companyId, userId, 'admin']);
    
    console.log('✅ Linked admin user to company');
    
    // Create sample branding
    await client.query(`
      INSERT INTO company_branding (
        company_id,
        brand_color_primary,
        brand_color_secondary,
        homepage_hero_title,
        homepage_hero_subtitle,
        homepage_features
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (company_id) DO UPDATE SET
        brand_color_primary = EXCLUDED.brand_color_primary,
        brand_color_secondary = EXCLUDED.brand_color_secondary,
        homepage_hero_title = EXCLUDED.homepage_hero_title,
        homepage_hero_subtitle = EXCLUDED.homepage_hero_subtitle,
        homepage_features = EXCLUDED.homepage_features
    `, [
      companyId,
      '#1e40af',
      '#f59e0b',
      'Professional Plastering Excellence',
      'Quality workmanship and reliable service for all your plastering needs across London and the South East.',
      JSON.stringify([
        'Interior & Exterior Plastering',
        'Decorative Finishes',
        'Insurance Work',
        'Commercial Projects',
        'Emergency Repairs',
        'Free Quotations'
      ])
    ]);
    
    console.log('✅ Created company branding');
    
    console.log('\n🎉 DEMO SETUP COMPLETE!');
    console.log('========================');
    console.log(`🌍 Live URL: https://plastermaster.workdoc360.com`);
    console.log(`🏢 Company: Plaster Master Ltd`);
    console.log(`👤 Admin: admin@plastermaster.co.uk`);
    console.log(`💰 Subscription: £65/month`);
    console.log(`🎯 Trade: Plastering specialist`);
    console.log('\nThe demo portal showcases:');
    console.log('• Professional branded homepage');
    console.log('• Complete compliance management');
    console.log('• CSCS card verification');
    console.log('• Document tracking system');
    console.log('• Multi-user management');
    console.log('• UK construction terminology');
    
    return companyId;
    
  } catch (error) {
    console.error('❌ Error setting up demo:', error);
    throw error;
  } finally {
    await client.end();
  }
}

setupPlasterMasterDemo().catch(console.error);