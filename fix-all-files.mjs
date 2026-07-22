import fs from 'fs'

const files = {
  'ShippingPolicyPage.tsx': 'c:/Users/611626781/Downloads/AuraLoom/project/src/pages/ShippingPolicyPage.tsx',
  'FAQPage.tsx': 'c:/Users/611626781/Downloads/AuraLoom/project/src/pages/FAQPage.tsx',
  'ReturnPolicyPage.tsx': 'c:/Users/611626781/Downloads/AuraLoom/project/src/pages/ReturnPolicyPage.tsx',
}

for (const [name, fp] of Object.entries(files)) {
  let c = fs.readFileSync(fp, 'utf8')

  if (name === 'ShippingPolicyPage.tsx') {
    // Issue:
