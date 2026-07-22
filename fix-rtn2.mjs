
              </div>
          </section>`

const newStr = `              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mt-3">
                <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">Tip: Please try on your items carefully. For clothing, we recommend trying over your own clothes to avoid soiling.</p>
              </div>
          </section>`

if (c.includes(oldStr)) {
  c = c.replace(oldStr, newStr)
  fs.writeFileSync(fp, c)
  console.log('FIXED: Added missing </div> before </section> in section 2')
} else {
  console.log('Pattern not found!')
  // Debug
  const idx = c.indexOf('Tip: Please try')
  if (idx >= 0) {
    console.log('Context:', JSON.stringify(c.substring(idx - 20, idx + 200)))
  }
}

// Final verification
const opens = (c.match(/<div[^>]*>/g)||[]).filter(t => !t.endsWith('/>'))
const closes = (c.match(/<\/div>/g)||[])
console.log(`div opens=${opens.length} closes=${closes.length} ${opens.length === closes.length ? 'BALANCED' : 'MISMATCH'}`)
