import MyCoursesPage from "@/components/home/dashboard/default/cards/topic/topic-page";

export default function ExploreCourses() {
    return (
        <>
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
    )
}