#!/usr/bin/env node

/**
 * AuraLoom — Data Extraction Script
 * ===================================
 *
 * Connects to your EXISTING Supabase (managed by Bolt) via .env credentials,
 * fetches ALL data from every table, and generates INSERT SQL statements
 * that you can run against your NEW Supabase.
 *
 * Usage:
 *   node scripts/extract-data.mjs
 *
 * Output:
 *   supabase/exported_data.sql  — INSERT statements for all tables
 *   supabase/exported_images.txt — List of image paths in storage (if any)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

// ─── 1. Read .env ──────────────────────────────────────────────
let supabaseUrl, supabaseAnonKey

try {
  const envPath = resolve(projectRoot, '.env')
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = trimmed.split('=').slice(1).join('=').replace(/["']/g, '').trim()
    }
    if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = trimmed.split('=').slice(1).join('=').replace(/["']/g, '').trim()
    }
  }
} catch {
  console.error('❌ Could not read .env file. Make sure it exists in the project root.')
  console.error('   It must contain:')
  console.error('     VITE_SUPABASE_URL=https://xxx.supabase.co')
  console.error('     VITE_SUPABASE_ANON_KEY=your-anon-key')
  process.exit(1)
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ .env file is missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

console.log(`🔗 Connecting to Supabase: ${supabaseUrl}`)
console.log('')

// ─── 2. Connection test ────────────────────────────────────────
// Test if the Supabase instance is reachable before trying to extract data
const origin = new URL(supabaseUrl).origin

function testConnection() {
  return new Promise((resolve) => {
    const req = https.get(`${origin}/rest/v1/`, {
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
      timeout: 10000,
    }, (res) => {
      res.resume() // consume response data to free up memory
      resolve(res.statusCode !== 0)
    })
    req.on('error', (e) => {
      resolve(false)
    })
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })
  })
}

// ─── 3. Helper: escape SQL string values ──────────────────────
function esc(val) {
  if (val === null || val === undefined) return 'NULL'
  if (typeof val === 'boolean') return val ? 'true' : 'false'
  if (typeof val === 'number') return String(val)
  const str = String(val).replace(/'/g, "''")
  return `'${str}'`
}

function escArray(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return `'{}'`
  const inner = arr
    .map(v => {
      const s = String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
      return `"${s}"`
    })
    .join(',')
  return `'{${inner}}'`
}

// ─── 4. Fetch data from all tables ─────────────────────────────
async function fetchData() {
  const output = []
  const errors = []
  const imagePaths = new Set()
  let connected = false
  let categories, subcategories, products, profiles, orders, orderItems, cartItems

  // Test connection first
  connected = await testConnection()
  if (!connected) {
    console.log('⚠️  Cannot connect to the Supabase instance at:')
    console.log(`   ${supabaseUrl}`)
    console.log('')
    console.log('   This usually means:')
    console.log('   1. The Bolt-managed Supabase project has been paused/stopped')
    console.log('   2. The URL in .env is incorrect or outdated')
    console.log('   3. Network/firewall is blocking the connection')
    console.log('')
    console.log('   To fix this, create a NEW Supabase project at https://supabase.com')
    console.log('   and update your .env file with the new URL and anon key.')
    console.log('')
    console.log('   For now, a minimal exported_data.sql will be generated for reference.')
  }

  // Start with DELETE statements
  output.push('-- ============================================================')
  output.push('-- AuraLoom — Exported Data from Bolt Supabase')
  output.push('-- ============================================================')
  output.push('')

  if (!connected) {
    output.push('-- ============================================================')
    output.push('-- ⚠️  COULD NOT CONNECT TO SUPABASE INSTANCE')
  output.push('-- ============================================================')
    output.push('--')
    output.push('-- The Supabase project at the URL in your .env file is unreachable.')
    output.push('-- This is expected — your Bolt-managed Supabase was paused/stopped.')
    output.push('--')
    output.push('-- ✅ NEXT STEPS:')
    output.push('--')
    output.push('-- 1. Create a NEW Supabase project at https://supabase.com')
    output.push('-- 2. Run "complete_migration.sql" in the SQL Editor to create all tables')
    output.push('--    (this also includes seed data for 3 categories + 12 subcategories)')
    output.push('-- 3. Update your .env file with the new project URL and anon key')
    output.push('-- 4. Re-run this script to extract any data (if you had products/orders)')
    output.push('--')
  } else {
    // Clear existing data
    output.push('-- Clear existing data (idempotent)')
    output.push('DELETE FROM products;')
    output.push('DELETE FROM order_items;')
    output.push('DELETE FROM orders;')
    output.push('DELETE FROM cart_items;')
    output.push('DELETE FROM subcategories;')
    output.push('DELETE FROM categories;')
    output.push('DELETE FROM password_reset_tokens;')
    output.push('')
  }

  if (connected) {
    // ── 4a. Categories ──────────────────────────────────────────
    output.push('-- ============================================================')
    output.push('-- CATEGORIES')
    output.push('-- ============================================================')
    output.push('')

    const catResult = await supabase.from('categories').select('*').order('sort_order')
    categories = catResult.data
    if (catResult.error) {
      errors.push(`categories: ${catResult.error.message}`)
    } else if (categories && categories.length > 0) {
      output.push('INSERT INTO categories (id, name, slug, description, image_url, is_active, sort_order, created_at) VALUES')
      const rows = categories.map(c => `  (${esc(c.id)}, ${esc(c.name)}, ${esc(c.slug)}, ${esc(c.description)}, ${esc(c.image_url)}, ${c.is_active}, ${c.sort_order}, ${esc(c.created_at)})`)
      output.push(rows.join(',\n') + ';')
      output.push('')
      console.log(`  ✅ Categories: ${categories.length} row(s)`)
      for (const c of categories) {
        if (c.image_url) imagePaths.add(c.image_url)
      }
    } else {
      output.push('-- No categories to insert')
      output.push('')
    }

    // ── 4b. Subcategories ──────────────────────────────────────
    const subResult = await supabase.from('subcategories').select('*').order('sort_order')
    subcategories = subResult.data
    if (subResult.error) {
      errors.push(`subcategories: ${subResult.error.message}`)
    } else if (subcategories && subcategories.length > 0) {
      output.push('-- ============================================================')
      output.push('-- SUBCATEGORIES')
      output.push('-- ============================================================')
      output.push('')
      output.push('INSERT INTO subcategories (id, category_id, name, slug, description, image_url, is_active, sort_order, created_at) VALUES')
      const rows = subcategories.map(s =>
        `  (${esc(s.id)}, ${esc(s.category_id)}, ${esc(s.name)}, ${esc(s.slug)}, ${esc(s.description)}, ${esc(s.image_url)}, ${s.is_active}, ${s.sort_order}, ${esc(s.created_at)})`
      )
      output.push(rows.join(',\n') + ';')
      output.push('')
      console.log(`  ✅ Subcategories: ${subcategories.length} row(s)`)
      for (const s of subcategories) {
        if (s.image_url) imagePaths.add(s.image_url)
      }
    }

    // ── 4c. Products ───────────────────────────────────────────
    const prodResult = await supabase.from('products').select('*').order('created_at', { ascending: false })
    products = prodResult.data
    if (prodResult.error) {
      errors.push(`products: ${prodResult.error.message}`)
    } else if (products && products.length > 0) {
      output.push('-- ============================================================')
      output.push('-- PRODUCTS')
      output.push('-- ============================================================')
      output.push('')
      output.push('INSERT INTO products (id, subcategory_id, name, slug, description, price, sale_price, discount_percentage, stock_qty, sku, images, is_active, is_featured, tags, created_at, updated_at) VALUES')
      const rows = products.map(p =>
        `  (${esc(p.id)}, ${esc(p.subcategory_id)}, ${esc(p.name)}, ${esc(p.slug)}, ${esc(p.description)}, ${p.price}, ${esc(p.sale_price)}, ${p.discount_percentage ?? 0}, ${p.stock_qty}, ${esc(p.sku)}, ${escArray(p.images)}, ${p.is_active}, ${p.is_featured}, ${escArray(p.tags)}, ${esc(p.created_at)}, ${esc(p.updated_at)})`
      )
      const BATCH = 50
      for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH)
        output.push(batch.join(',\n') + ';')
      }
      output.push('')
      console.log(`  ✅ Products: ${products.length} row(s)`)
      for (const p of products) {
        if (p.images && Array.isArray(p.images)) {
          for (const img of p.images) {
            if (img && !img.startsWith('http')) imagePaths.add(img)
          }
        }
      }
    }

    // ── 4d. Profiles ───────────────────────────────────────────
    const profResult = await supabase.from('profiles').select('*')
    profiles = profResult.data
    if (profResult.error) {
      errors.push(`profiles: ${profResult.error.message}`)
    } else if (profiles && profiles.length > 0) {
      output.push('-- ============================================================')
      output.push('-- PROFILES')
      output.push('-- ============================================================')
      output.push('')
      output.push('INSERT INTO profiles (id, full_name, phone, address_line1, address_line2, city, state, pincode, is_admin, created_at, updated_at) VALUES')
      const rows = profiles.map(p =>
        `  (${esc(p.id)}, ${esc(p.full_name)}, ${esc(p.phone)}, ${esc(p.address_line1)}, ${esc(p.address_line2)}, ${esc(p.city)}, ${esc(p.state)}, ${esc(p.pincode)}, ${p.is_admin}, ${esc(p.created_at)}, ${esc(p.updated_at)})`
      )
      output.push(rows.join(',\n') + ';')
      output.push('')
      console.log(`  ✅ Profiles: ${profiles.length} row(s)`)
    }

    // ── 4e. Orders ─────────────────────────────────────────────
    const ordResult = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    orders = ordResult.data
    if (ordResult.error) {
      errors.push(`orders: ${ordResult.error.message}`)
    } else if (orders && orders.length > 0) {
      output.push('-- ============================================================')
      output.push('-- ORDERS')
      output.push('-- ============================================================')
      output.push('')
      output.push('INSERT INTO orders (id, user_id, order_number, status, payment_status, subtotal, discount, shipping_cost, total, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode, notes, created_at, updated_at) VALUES')
      const rows = orders.map(o =>
        `  (${esc(o.id)}, ${esc(o.user_id)}, ${esc(o.order_number)}, ${esc(o.status)}, ${esc(o.payment_status)}, ${o.subtotal}, ${o.discount}, ${o.shipping_cost ?? 0}, ${o.total}, ${esc(o.shipping_name)}, ${esc(o.shipping_phone)}, ${esc(o.shipping_address)}, ${esc(o.shipping_city)}, ${esc(o.shipping_state)}, ${esc(o.shipping_pincode)}, ${esc(o.notes)}, ${esc(o.created_at)}, ${esc(o.updated_at)})`
      )
      output.push(rows.join(',\n') + ';')
      output.push('')
      console.log(`  ✅ Orders: ${orders.length} row(s)`)
    }

    // ── 4f. Order Items ────────────────────────────────────────
    const oiResult = await supabase.from('order_items').select('*')
    orderItems = oiResult.data
    if (oiResult.error) {
      errors.push(`order_items: ${oiResult.error.message}`)
    } else if (orderItems && orderItems.length > 0) {
      output.push('-- ============================================================')
      output.push('-- ORDER ITEMS')
      output.push('-- ============================================================')
      output.push('')
      output.push('INSERT INTO order_items (id, order_id, product_id, product_name, product_image, quantity, price, subtotal, created_at) VALUES')
      const rows = orderItems.map(oi =>
        `  (${esc(oi.id)}, ${esc(oi.order_id)}, ${esc(oi.product_id)}, ${esc(oi.product_name)}, ${esc(oi.product_image)}, ${oi.quantity}, ${oi.price}, ${oi.subtotal}, ${esc(oi.created_at)})`
      )
      output.push(rows.join(',\n') + ';')
      output.push('')
      console.log(`  ✅ Order Items: ${orderItems.length} row(s)`)
      for (const oi of orderItems) {
        if (oi.product_image && !oi.product_image.startsWith('http')) imagePaths.add(oi.product_image)
      }
    }

    // ── 4g. Cart Items ────────────────────────────────────────
    const cartResult = await supabase.from('cart_items').select('*')
    cartItems = cartResult.data
    if (cartResult.error) {
      if (!cartResult.error.message.includes('permission')) {
        errors.push(`cart_items: ${cartResult.error.message}`)
      }
    } else if (cartItems && cartItems.length > 0) {
      output.push('-- ============================================================')
      output.push('-- CART ITEMS')
      output.push('-- ============================================================')
      output.push('')
      output.push('INSERT INTO cart_items (id, user_id, product_id, quantity, created_at) VALUES')
      const rows = cartItems.map(ci =>
        `  (${esc(ci.id)}, ${esc(ci.user_id)}, ${esc(ci.product_id)}, ${ci.quantity}, ${esc(ci.created_at)})`
      )
      output.push(rows.join(',\n') + ';')
      output.push('')
      console.log(`  ✅ Cart Items: ${cartItems.length} row(s)`)
    }

    // ── Summary ─────────────────────────────────────────────────
    const tableCounts = {
      categories: categories?.length ?? 0,
      subcategories: subcategories?.length ?? 0,
      products: products?.length ?? 0,
      profiles: profiles?.length ?? 0,
      orders: orders?.length ?? 0,
      order_items: orderItems?.length ?? 0,
      cart_items: cartItems?.length ?? 0,
    }

    output.push('-- ============================================================')
    output.push('-- DATA EXTRACTION COMPLETE')
    output.push('-- ============================================================')
    output.push('')
    output.push('-- Summary of extracted data:')
    for (const [table, count] of Object.entries(tableCounts)) {
      output.push(`--   ${table}: ${count} row(s)`)
    }
    output.push('')
    const totalRows = Object.values(tableCounts).reduce((sum, c) => sum + c, 0)
    if (totalRows === 0) {
      output.push('-- ⚠️  No data was found in any table.')
      output.push('--    Run complete_migration.sql in your NEW Supabase SQL Editor to get seed data.')
      output.push('--    Then re-run this script after adding real data to extract it.')
    }
    output.push('')

    // ── Write files ─────────────────────────────────────────────
    const sqlPath = resolve(projectRoot, 'supabase', 'exported_data.sql')
    writeFileSync(sqlPath, output.join('\n'), 'utf-8')
    console.log(`\n📄 Written to: supabase/exported_data.sql`)

    if (imagePaths.size > 0) {
      const imgPath = resolve(projectRoot, 'supabase', 'exported_images.txt')
      writeFileSync(imgPath, Array.from(imagePaths).sort().join('\n') + '\n', 'utf-8')
      console.log(`🖼️  Written to: supabase/exported_images.txt (${imagePaths.size} file(s))`)
    }

    if (errors.length > 0) {
      console.log(`\n⚠️  ${errors.length} table(s) had errors:`)
      for (const e of errors) console.log(`   - ${e}`)
    }
  } else {
    // Connection failed — write the informational file
    output.push('-- ============================================================')
    output.push('-- DATA EXTRACTION COMPLETE (no connection)')
    output.push('-- ============================================================')
    output.push('')

    const sqlPath = resolve(projectRoot, 'supabase', 'exported_data.sql')
    writeFileSync(sqlPath, output.join('\n'), 'utf-8')
    console.log(`\n📄 Written to: supabase/exported_data.sql`)
  }

  console.log('\n✅ Done!')
}

fetchData().catch(err => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
