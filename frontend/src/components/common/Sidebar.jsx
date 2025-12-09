import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);

    // Default to 'MEMBER' if no role (shouldn't happen in protected route)
    const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('MANAGER');

    const adminMenu = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: '🏠' },
        { name: 'Branch Management', path: '/admin/branches', icon: '🏢' },
        { name: 'Staff Management', path: '/admin/staff', icon: '👥' },
        { name: 'Packages', path: '/admin/packages', icon: '📦' },
        { name: 'Refund Requests', path: '/admin/refunds', icon: '💸' },
    ];

    const memberMenu = [
        { name: 'My Membership', path: '/my-membership', icon: '💳' },
        { name: 'My Sessions', path: '/my-bookings', icon: '📅' },
        { name: 'Buy Package', path: '/packages', icon: '🛒' },
        { name: 'Personal Trainers', path: '/trainers', icon: '🏋️' },
        { name: 'AI Coach', path: '/ai-planner', icon: '🤖' },
        { name: 'My Profile', path: '/profile', icon: '👤' },
    ];

    const menuItems = isAdmin ? adminMenu : memberMenu;

    return (
        <div className="flex h-screen w-64 flex-col bg-gray-900 text-white shadow-lg">
            <div className="flex h-16 items-center justify-center border-b border-gray-800 text-xl font-bold text-red-500">
                GymNexus {isAdmin ? 'Admin' : 'Member'}
            </div>
            <nav className="flex-1 px-2 py-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`mb-1 flex items-center rounded px-4 py-2 transition-colors ${location.pathname === item.path
                            ? 'bg-red-600 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <span className="mr-3">{item.icon}</span>
                        {item.name}
                    </Link>
                ))}
            </nav>
            <div className="border-t border-gray-800 p-4">
                <button
                    onClick={logout}
                    className="flex w-full items-center justify-center rounded bg-gray-800 py-2 hover:bg-gray-700 text-sm"
                >
                    🚪 Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
