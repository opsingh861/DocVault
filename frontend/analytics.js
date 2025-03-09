
// Analytics related functionality

// Load analytics data
function loadAnalyticsData() {
    // For this demo, we'll use mock data for the analytics
    // In a real application, this would be fetched from the server

    // Set mock statistics
    document.getElementById('total-scans').textContent = '124';
    document.getElementById('today-scans').textContent = '8';
    document.getElementById('credits-used').textContent = '105';
    document.getElementById('active-users').textContent = '12';

    // Create mock activity chart
    const activityChart = document.getElementById('activity-chart');
    activityChart.innerHTML = `
        <div class="relative h-full w-full">
            <div class="absolute bottom-0 left-0 right-0 h-48 flex items-end">
                <div class="flex-1 mx-1">
                    <div class="bg-blue-500 h-12 rounded-t"></div>
                    <div class="text-xs text-center mt-1">Mon</div>
                </div>
                <div class="flex-1 mx-1">
                    <div class="bg-blue-500 h-20 rounded-t"></div>
                    <div class="text-xs text-center mt-1">Tue</div>
                </div>
                <div class="flex-1 mx-1">
                    <div class="bg-blue-500 h-28 rounded-t"></div>
                    <div class="text-xs text-center mt-1">Wed</div>
                </div>
                <div class="flex-1 mx-1">
                    <div class="bg-blue-500 h-16 rounded-t"></div>
                    <div class="text-xs text-center mt-1">Thu</div>
                </div>
                <div class="flex-1 mx-1">
                    <div class="bg-blue-500 h-32 rounded-t"></div>
                    <div class="text-xs text-center mt-1">Fri</div>
                </div>
                <div class="flex-1 mx-1">
                    <div class="bg-blue-500 h-24 rounded-t"></div>
                    <div class="text-xs text-center mt-1">Sat</div>
                </div>
                <div class="flex-1 mx-1">
                    <div class="bg-blue-500 h-16 rounded-t"></div>
                    <div class="text-xs text-center mt-1">Sun</div>
                </div>
            </div>
            <div class="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
                <div>30</div>
                <div>20</div>
                <div>10</div>
                <div>0</div>
            </div>
        </div>
    `;

    // Create mock credit usage chart
    const creditChart = document.getElementById('credit-chart');
    creditChart.innerHTML = `
        <div class="relative h-full w-full">
            <div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-48 h-48" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="10" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" stroke-width="10" stroke-dasharray="251.2" stroke-dashoffset="62.8" transform="rotate(-90 50 50)" />
                    <text x="50" y="50" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="bold">75%</text>
                </svg>
            </div>
            <div class="absolute bottom-4 left-0 right-0">
                <div class="flex justify-center space-x-4 text-sm">
                    <div class="flex items-center">
                        <div class="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                        <span>Used Credits</span>
                    </div>
                    <div class="flex items-center">
                        <div class="w-3 h-3 bg-gray-200 rounded-full mr-1"></div>
                        <span>Available Credits</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}