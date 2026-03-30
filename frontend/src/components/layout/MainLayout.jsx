import { Link, useLocation } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  const location = useLocation();
  const isCreateIssuePage = location.pathname === "/issues/create";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 overflow-auto pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Floating Action Button for Report Issue on mobile */}
      {!isCreateIssuePage && (
        <Link to="/issues/create" className="lg:hidden">
          <Button
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          >
            <PlusCircle className="h-6 w-6" />
            <span className="sr-only">Report Issue</span>
          </Button>
        </Link>
      )}
    </div>
  );
}
