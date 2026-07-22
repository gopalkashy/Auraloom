import fs from 'fs'
const fp = 'c:/Users/611626781/Downloads/AuraLoom/project/src/pages/ReturnPolicyPage.tsx'
let c = fs.readFileSync(fp, 'utf8')

// Fix 1: Add missing amber tip div block in section 2
old1 = `              <ul className="list-disc pl-5 space-y-1">\n                <li><strong>Unused and unworn</strong> &mdash; Item must not show any signs of wear, wash, or use.</li>\n                <li><strong>Original packaging</strong> &mdash; Tags, boxes, and any accompanying accessories must be intact.</li>\n                <li><strong>No damages caused by customer</strong> &mdash; Items damaged due to improper use, mishandling, or alteration will not be accepted.</li>\n                <li><strong>Hygiene products</strong> &mdash; Earrings, lingerie, and other intimate items are <strong>not eligible</strong> for return for hygiene reasons.</li>\n              </ul>`
old2 = `              </div>`
c = c.replace(old1 + '\n\n' + old2, old1 + '\n              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mt-3">\n                <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">Tip: Please try on your items carefully. For clothing, we recommend trying over your own clothes to avoid soiling.</p>\n              </div>\n            ' + old2)

// Fix 2: Add missing </div> for container at the end
c = c.replace('</p>\n        </div>\n    </Layout>', '</p>\n        </div>\n      </div>\n    </Layout>')

fs.writeFileSync(fp, c, 'utf8')
// Verify
const o = (c.match(/<div[^>]*>/g)||[]).filter(t=>!t.endsWith('/>'))
const e = (c.match(/<\/div>/g)||[])
console.log(`Div opens: ${o.length}, closes: ${e.length} -> ${o.length === e.length ? 'BALANCED' : 'MISMATCH'}`)
