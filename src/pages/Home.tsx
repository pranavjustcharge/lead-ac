
import { Activity, CalendarCheck, PhoneCall, Timer } from 'lucide-react';

// The main App component that renders the entire dashboard UI.
const Home = () => {
  // Mock data for the stat cards.
  const stats = [
    {
      id: 1,
      title: 'Active Campaigns',
      value: '4',
      icon: <Activity className="text-white" />,
      iconBg: 'bg-teal-500',
    },
    {
      id: 2,
      title: 'Total Follow Up',
      value: '15',
      icon: <CalendarCheck className="text-white" />,
      iconBg: 'bg-green-600',
    },
    {
      id: 3,
      title: 'Call Made',
      value: '58',
      icon: <PhoneCall className="text-white" />,
      iconBg: 'bg-orange-500',
    },
    {
      id: 4,
      title: 'Total Duration',
      value: '4 H, 28 M, 17 S',
      icon: <Timer className="text-white" />,
      iconBg: 'bg-pink-500',
    },
  ];

  // Mock data for the pie chart.
  const pieChartData = [
    { label: 'Live Event Campaign', value: 45, color: '#16A085' },
    { label: 'Sell Home Loan Campaign', value: 20, color: '#2C3E50' },
    { label: 'Social Media Campaign', value: 15, color: '#2ECC71' },
    { label: 'Electronic Item Sell Campaign', value: 20, color: '#9B59B6' },
  ];

  // Mock data for the bar chart.
  const barChartData = [
    { date: '2025-07-13', value: 2 },
    { date: '2025-07-16', value: 1 },
    { date: '2025-07-20', value: 4 },
    { date: '2025-07-22', value: 1 },
    { date: '2025-07-23', value: 1 },
    { date: '2025-07-25', value: 2 },
    { date: '2025-07-26', value: 3 },
    { date: '2025-07-27', value: 3 },
    { date: '2025-07-28', value: 4 },
    { date: '2025-07-29', value: 5 },
    { date: '2025-07-30', value: 6 },
    { date: '2025-07-31', value: 6 },
    { date: '2025-08-01', value: 26 },
  ];

  // Calculate the total for the pie chart to determine percentages.
  const totalPieValue = pieChartData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      {/* Header section with date picker */}
      <div className="flex justify-start mb-6">
        <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <input type="date" className="bg-transparent outline-none text-sm text-gray-700" />
          <span className="text-gray-400 text-sm">→</span>
          <input type="date" className="bg-transparent outline-none text-sm text-gray-700" />
        </div>
      </div>

      {/* Stat cards section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white p-5 border border-gray-300 rounded-lg shadow-md flex items-center gap-6"
          >

            <div className={`p-3 rounded-lg ${stat.iconBg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xl text-gray-800">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts section */}
      <div className="flex flex-row gap-4">
        {/* Pie chart card */}
        <div className="bg-white p-6 rounded-xl shadow-md w-[30%]">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Actioned Campaigns</h2>
          <div className="flex flex-col items-center justify-center gap-8">
            {/* SVG Donut Chart */}
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <circle
                  className="stroke-gray-200"
                  cx="18"
                  cy="18"
                  r="15.915494309189535"
                  fill="transparent"
                  strokeWidth="3.5"
                />
                {(() => {
                  let startOffset = 0;
                  return pieChartData.map((item, index) => {
                    const percentage = (item.value / totalPieValue) * 100;
                    const strokeDashoffset = 100 - startOffset - percentage;
                    startOffset += percentage;
                    return (
                      <circle
                        key={index}
                        className="transition-all duration-500 ease-in-out"
                        cx="18"
                        cy="18"
                        r="15.915494309189535"
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth="3.5"
                        strokeDasharray={`${percentage} ${100 - percentage}`}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 18 18)"
                      />
                    );
                  });
                })()}
                {/* Inner circle for the donut effect */}
                <circle
                  cx="18"
                  cy="18"
                  r="12"
                  fill="white"
                />
              </svg>
            </div>
            {/* Pie chart legend */}
            <div className="flex flex-col space-y-2 text-sm text-gray-600">
              {pieChartData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-10 h-4  mr-2"
                    style={{ backgroundColor: item.color }}
                    title={item.label}
                  ></div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar chart card */}
        <div className="bg-white p-6 rounded-xl shadow-md w-[70%]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Call Made</h2>
            <a href="#" className="text-blue-500 hover:underline text-sm">View All</a>
          </div>
          <div className="flex">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between h-56 text-xs text-gray-500 text-right pr-2">
              <span>30</span>
              <span>25</span>
              <span>20</span>
              <span>15</span>
              <span>10</span>
              <span>5</span>
              <span>0</span>
            </div>
            {/* Bar chart area */}
            <div className="flex-1 flex items-end h-56 border-l border-b border-gray-300 pl-2">
              <div className="flex flex-1 items-end h-full">
                {barChartData.map((item, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col justify-end items-center h-full group"
                  >
                    <div
                      className="bg-teal-500 w-3 rounded-t-sm transition-all duration-300 hover:bg-teal-600"
                      style={{ height: `${(item.value / 30) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* X-axis labels */}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            {barChartData.map((item, index) => (
              <span key={index} className="flex-1 text-center truncate">
                {item.date.slice(5)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home