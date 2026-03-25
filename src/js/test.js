import { TabSet, TabList, Tab, TabPanel } from "./tabs.js"


export async function runTabsStressTest(numSets = 50, tabsPerSet = 10) {
  const container = document.createElement('div');
  container.id = "benchmark-container";
  document.body.appendChild(container);

  console.log(`🚀 Starting Stress Test: ${numSets} sets, ${tabsPerSet} tabs each...`);

  // 1. Measure Rendering Time
  performance.mark('start-render');

  for (let i = 0; i < numSets; i++) {
    const tabset = document.createElement('aria-tabset');
    const tablist = document.createElement('aria-tablist');
    tablist.setAttribute('aria-label', `Test Set ${i}`);

    for (let j = 0; j < tabsPerSet; j++) {
      const tabId = `t-${i}-${j}`;
      const panelId = `p-${i}-${j}`;

      const tab = document.createElement('aria-tab');
      tab.id = tabId;
      tab.setAttribute('aria-controls', panelId);
      tab.textContent = `Tab ${j}`;
      if (j === 0) ariaState(tab, 'selected', 'true');

      const panel = document.createElement('aria-tabpanel');
      panel.id = panelId;
      panel.textContent = `Content for panel ${i}-${j}`;
      panel.hidden = (j !== 0);

      tablist.appendChild(tab);
      tabset.appendChild(panel);
    }

    tabset.prepend(tablist);
    container.appendChild(tabset);
  }

  performance.mark('end-render');
  performance.measure('Initial Render', 'start-render', 'end-render');

  // 2. Simulate Rapid Interaction (The "Thrasher")
  console.log("🖱️ Simulating rapid tab switching...");
  let cycles = 0;
  const maxCycles = 50;

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      performance.mark(`cycle-start-${cycles}`);

      // Randomly select one tab in every set and "click" it
      const allSets = container.querySelectorAll('aria-tabset');
      allSets.forEach(set => {
        const tabs = set.querySelectorAll('aria-tab');
        const randomIdx = Math.floor(Math.random() * tabsPerSet);
        // Simulate selection via ARIA state change (which triggers our logic)
        ariaState(tabs[randomIdx], 'selected', 'true');
      });

      performance.mark(`cycle-end-${cycles}`);
      cycles++;

      if (cycles >= maxCycles) {
        clearInterval(interval);
        console.log("✅ Stress test complete.");
        reportResults();
        resolve();
      }
    }, 50); // 50ms interval (20 times per second)
  });
}


function reportResults() {
  const measures = performance.getEntriesByType('measure');
  measures.forEach(m => {
    console.log(`${m.name}: ${m.duration.toFixed(2)}ms`);
  });

  const entries = performance.getEntries();
  const totalSwitchTime = entries
    .filter(e => e.name.includes('cycle-start'))
    .reduce((acc, curr, i) => {
      // Corrected: Use plural getEntriesByName and check length
      const endEntries = performance.getEntriesByName(`cycle-end-${i}`);
      const end = endEntries.length > 0 ? endEntries[0] : null;

      return acc + (end ? end.startTime - curr.startTime : 0);
    }, 0);

  console.log(`Average Tab Switch Latency: ${(totalSwitchTime / 50).toFixed(2)}ms`);
}


export async function runMemoryLeakTest(iterations = 50) {
    const container = document.createElement('div');
    container.id = "test-bench";
    document.body.appendChild(container);

    console.log(`🧪 Starting Leak Test: ${iterations} cycles of creation/destruction...`);

    for (let i = 0; i < iterations; i++) {
        // 1. Create 100 sets
        for (let j = 0; j < 100; j++) {
            const set = document.createElement('aria-tabset');
            set.innerHTML = `
                <aria-tablist aria-label="Leak Test">
                    <aria-tab aria-controls="p-${i}-${j}" aria-selected="true">Tab</aria-tab>
                </aria-tablist>
                <aria-tabpanel id="p-${i}-${j}">Content</aria-tabpanel>
            `;
            container.appendChild(set);
        }

        // 2. Small delay to let the browser process the DOM
        await new Promise(r => setTimeout(r, 10));

        // 3. Complete Destruction
        container.innerHTML = '';

        if (i % 10 === 0) {
            console.log(`Completed cycle ${i}... Check memory trend.`);
        }
    }

    console.log("🏁 Test finished. Open DevTools Memory tab and click the 'Trash' icon to force GC.");
}
