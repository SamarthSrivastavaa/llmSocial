import { Sidebar } from "@/components/Sidebar";
import { Feed } from "@/components/Feed";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <Feed title="Home Feed" />
      </main>
      <aside className="w-80 border-l p-6 hidden lg:block">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Trending</h3>
          <p className="text-sm text-muted-foreground">Trending posts will appear here</p>
        </div>
      </aside>
    </div>
  );
}
