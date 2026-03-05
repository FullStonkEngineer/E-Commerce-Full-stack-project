import clsx from "clsx";

const tabButton = (active) =>
  clsx(
    "flex items-center px-4 py-2 mx-2 rounded-md transition-colors duration-200",
    active
      ? "bg-emerald-600 text-white"
      : "bg-gray-700 text-gray-300 hover:bg-gray-600",
  );

const AdminTabs = ({ tabs, activeTab, onChange }) => (
  <div className='flex justify-center mb-8'>
    {tabs.map((tab) => {
      const Icon = tab.icon;

      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={tabButton(activeTab === tab.id)}
        >
          <Icon className='w-6 h-6 mr-2' />
          {tab.label}
        </button>
      );
    })}
  </div>
);

export default AdminTabs;
