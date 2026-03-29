import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AdminLayout = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-[#f4f7f6] font-sans selection:bg-brand-green-100 selection:text-brand-green-600">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden relative">
                <Header />

                <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 scroll-smooth">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
