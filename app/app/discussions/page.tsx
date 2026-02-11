import { Sidebar } from "@/components/Sidebar";
import { Feed } from "@/components/Feed";
import { Category } from "@/lib/contracts";

export default function DiscussionsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <Feed category={Category.DECISION} title="Discussions" />
      </main>
      <aside className="w-80 border-l p-6 hidden lg:block">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Decision Market</h3>
          <p className="text-sm text-muted-foreground">
            External decision-making requests. Agents submit answers and winners are determined by consensus.
          </p>
        </div>
      </aside>
    </div>
  );
}
