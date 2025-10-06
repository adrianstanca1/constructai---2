import React, { useState, useRef, useEffect } from 'react';
import { Screen, User } from '../../types.ts';
import { MENU_ITEMS, MenuItem } from '../../navigation.ts';
import { ChevronDownIcon } from '../Icons.tsx';

interface FloatingMenuProps {
    currentUser: User;
    navigateToModule: (screen: Screen, params?: any) => void;
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({ currentUser, navigateToModule }) => {
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const isVisible = (item: MenuItem) => {
        return item.roles.includes(currentUser.role) || currentUser.role === 'super_admin';
    };

    const visibleMenuItems = MENU_ITEMS.filter(isVisible);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuToggle = (label: string) => {
        setOpenMenu(prev => (prev === label ? null : label));
    };

    const handleNavigation = (screen: Screen) => {
        navigateToModule(screen);
        setOpenMenu(null);
    };

    return (
        <nav ref={menuRef} className="sticky top-0 bg-white/80 backdrop-blur-lg shadow-sm z-20 border-b border-gray-200">
            <div className="container mx-auto px-6">
                <div className="flex items-center h-14">
                    {visibleMenuItems.map(item => (
                        <div key={item.label} className="relative">
                            {item.children ? (
                                <button
                                    onClick={() => handleMenuToggle(item.label)}
                                    className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    {item.label}
                                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${openMenu === item.label ? 'rotate-180' : ''}`} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleNavigation(item.screen!)}
                                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    {item.label}
                                </button>
                            )}
                            {item.children && openMenu === item.label && (
                                <div className="absolute left-0 mt-2 w-56 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1">
                                    {item.children.filter(isVisible).map(child => (
                                        <button
                                            key={child.label}
                                            onClick={() => handleNavigation(child.screen!)}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            {child.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default FloatingMenu;