type MonthlyDistance = {
  year: number;
  month: number;
  distance: number;
};

type DistanceSummary = {
  totalDistance: number;
  monthlyDistance: MonthlyDistance[];
};

const DATA_URL = '/data/distance_summary.json';

const totalDistance = document.querySelector<HTMLSpanElement>('#total-distance');
const monthlyList = document.querySelector<HTMLTableSectionElement>('#monthly-list');
const copyButton = document.querySelector<HTMLButtonElement>('#copy-distances');

let currentSummary: DistanceSummary | null = null;

async function loadDistanceSummary(): Promise<DistanceSummary> {
  const response = await fetch(DATA_URL);

  if (!response.ok) {
    throw new Error(`Failed to load distance data: ${response.status}`);
  }

  const payload = (await response.json()) as DistanceSummary[];
  const summary = payload[0];

  if (!summary) {
    throw new Error('Distance data was empty.');
  }

  return summary;
}

function formatMonth(item: MonthlyDistance): string {
  return `${item.year}/${String(item.month).padStart(2, '0')}`;
}

function renderMonthlyDistance(items: MonthlyDistance[]): void {
  if (!monthlyList) return;

  monthlyList.innerHTML = items
    .map(
      (item) => `
        <tr>
          <td>${formatMonth(item)}</td>
          <td class="number">${item.distance} km</td>
        </tr>
      `,
    )
    .join('');
}

function buildCopyText(summary: DistanceSummary): string {
  const rows = summary.monthlyDistance.map(
    (item) => `${formatMonth(item)}\t${item.distance} km`,
  );

  return [`総距離\t${summary.totalDistance} km`, "", "月\t距離", ...rows].join("\n");
}

function render(summary: DistanceSummary): void {
  currentSummary = summary;

  if (totalDistance) {
    totalDistance.textContent = String(summary.totalDistance);
  }

  renderMonthlyDistance(summary.monthlyDistance);

  if (copyButton) {
    copyButton.disabled = false;
  }
}

copyButton?.addEventListener('click', async () => {
  if (!currentSummary) return;

  await navigator.clipboard.writeText(buildCopyText(currentSummary));
  copyButton.textContent = 'コピーしました';

  window.setTimeout(() => {
    copyButton.textContent = 'コピー';
  }, 2000);
});

loadDistanceSummary()
  .then(render)
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    document.body.innerHTML = `<p class="error">データの読み込みに失敗しました: ${message}</p>`;
  });
