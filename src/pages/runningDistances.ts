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

function render(summary: DistanceSummary): void {
  if (totalDistance) {
    totalDistance.textContent = String(summary.totalDistance);
  }

  renderMonthlyDistance(summary.monthlyDistance);
}

loadDistanceSummary()
  .then(render)
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    document.body.innerHTML = `<p class="error">データの読み込みに失敗しました: ${message}</p>`;
  });
