import fs from 'fs';

function fixFile(fp, fixes) {
  let c = fs.readFileSync(fp, 'utf8');
  for (const [oldStr, newStr] of fixes) {
    if (c.includes(oldStr)) {
      c = c.replace(oldStr, newStr);
      console.log(`Fixed pattern in ${fp.split('/').pop()}`);
    } else {
      console.log(`Pattern not found in ${fp.split('/').pop()}`);
    }
  }
  fs.writeFileSync(fp, c, 'utf8');

  // Verify div balance
  const opens = (c.match(/<div[^>]*>/g)||[]).filter(t => !t.endsWith('/>'));
  const closes = (c.match(/<\/div>/g)||[]);
  const layoutOpens = (c.match(/<Layout>/g)||[]).length;
  const layoutCloses = (c.match(/<\/Layout>/g)||[]).length;
  const sectionOpens = (c.match(/<section[^>]*>/g)||[]).length;
  const sectionCloses = (c.match(/<\/section>/g)||[]).length;
  console.log(`${fp.split('/').pop()}: div ${opens.length}/${closes.length} ${opens.length===closes.length?'OK':'MISMATCH'} | Layout ${layoutOpens}/${layoutCloses} ${layoutOpens===layoutCloses?'OK':'FAIL'} | section ${sectionOpens}/${sectionCloses} ${sectionOpens===sectionCloses?'OK':'FAIL'}`);
}

// ===================== SHIPPING POLICY PAGE =====================
fixFile(
  'C:/Users/611626781/Downloads/AuraLoom/project/src/pages/ShippingPolicyPage.tsx',
  [
    // Fix end of file - remove extra </div>
    [
      `          </p>
        </div>
          </div>
    </Layout>`,
      `          </p>
        </div>
    </Layout>`
    ],
    // Fix section 2 - missing </div> for bg-secondary div, move ul inside it, close section
    [
      `              </div>
            </section>

            {/* 3. Delivery Timeframe */}`,
      `                </ul>
              </div>
            </section>

            {/* 3. Delivery Timeframe */}`
    ]
  ]
);

// ===================== FAQ PAGE =====================
fixFile(
  'C:/Users/611626781/Downloads/AuraLoom/project/src/pages/FAQPage.tsx',
  [
    // Fix end of file - missing </div> for space-y-10
    [
      `            </div>
      </div>
    </Layout>`,
      `            </div>
        </div>
    </Layout>`
    ]
  ]
);

// ===================== RETURN POLICY PAGE =====================
fixFile(
  'C:/Users/611626781/Downloads/AuraLoom/project/src/pages/ReturnPolicyPage.tsx',
  [
    // Fix end of file - missing </div> for space-y-10
    [
      `</p>
        </div>`,
      `</p>
        </div>`
    ],
    // Fix section 2 - add the amber tip block and proper closing
    [
      `              </ul>

              </div>
          </section>`,
      `              </ul>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mt-3">
                <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">Tip: Please try on your items carefully. For clothing, we recommend trying over your own clothes to avoid soiling.</p>
              </div>
          </section>`
    ]
  ]
);

console.log('\nDone fixing all files.');
