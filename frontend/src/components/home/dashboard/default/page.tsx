import SubscriptionsCard from "./cards/subscriptions";
import MetricCard from "./cards/metric";
import WelcomeCard from "./cards/welcome-card";
import TopicProgressChart from "./cards/topic-progress";
import StreakCalendar from "./cards/streak";
import MyCoursesPage from "./cards/topic/topic-page";

export default function Page() {
  return (
    <>
      {/* ===== PAGE TITLE ===== */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard
        </h1>
      </div>

      {/* ===== ROW 1: 3 COLUMNS - 2 ROWS ===== */}
      <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
        {/* Welcome: span 2 cols + 2 rows */}
        <div className="lg:col-span-2 lg:row-span-2 h-full">
          <WelcomeCard
            name="VietViet" />
        </div>

        {/* Right top */}
        <SubscriptionsCard />

        {/* Right bottom */}
        <TopicProgressChart />
      </div>

      {/* ===== ROW 2: STREAK + METRIC ===== */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <StreakCalendar />
        <MetricCard />
      </div>

      {/* ===== ROW 3: MY COURSES ===== */}
      <div className="mt-10 flex flex-col items-center text-center space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight">
          Explore Courses
        </h2>

        <p className="max-w-xl text-base text-muted-foreground">
          Learning topics designed especially for you.
        </p>
      </div>

      <div className="mt-6">
        <MyCoursesPage />
      </div>

    </>
  );
}

