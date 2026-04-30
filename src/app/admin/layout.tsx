<<<<<<< Updated upstream
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-asphalt text-paper font-montserrat">
      <AdminSidebar />
      <main className="w-full min-w-0 flex-1 px-4 pb-10 pt-32 md:px-6 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
=======
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-asphalt text-paper font-montserrat">
      <AdminSidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
>>>>>>> Stashed changes
