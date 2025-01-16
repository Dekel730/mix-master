import { FaCocktail, FaUser, FaSearch } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { authGet } from "../utils/requests";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

import { CocktailsData, defaultCocktailsData } from "../types/cocktail";
import Feed from "../components/Feed";
import Explore from "../components/Explore";
import Search from "../components/Search";

const Home = () => {
    const tabs = [
        {
            id: "feed",
            label: "Feed",
            icon: FaUser,
            component: Feed,
        },
        {
            id: "explore",
            label: "Explore",
            icon: FaCocktail,
            component: Explore,
        },
        {
            id: "search",
            label: "Search",
            icon: FaSearch,
            component: Search,
        },
    ];
    const [activeTab, setActiveTab] = useState(tabs[0].id);
    const hasRun = useRef(false);

    const TabContent =
        tabs.find((tab) => tab.id === activeTab)?.component || Feed;

    const [CocktailsData, setCocktailsData] =
        useState<CocktailsData>(defaultCocktailsData);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const getFeedPosts = async (
        page?: number,
        loading?: boolean
    ): Promise<boolean> => {
        page = page || 1;
        if (loading) {
            setIsLoading(true);
        }
        let result = false;

        await authGet(
            `/post/?page=${page}`,
            (message: string) => {
                toast.error(message);
            },
            (data: CocktailsData) => {
                setCocktailsData((prev: CocktailsData) => ({
                    cocktails: [...prev.cocktails, ...data.cocktails],
                    count: data.count,
                    pages: data.pages,
                }));
                result = true;
            }
        );

        if (loading) {
            setIsLoading(false);
        }
        return result;
    };

    useEffect(() => {
        if (!hasRun.current) {
            hasRun.current = true;
            getFeedPosts(1, true);
        }
    }, []);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <main className=" bg-[#1a1a1a] text-white">
            <div className="w-full flex-1 p-4 text-center">
                <h1 className="text-2xl font-bold mb-6">Home</h1>
                <div className="flex flex-col md:flex-row gap-4 text-start min-h-[calc(100vh-200px)]">
                    {/* Sidebar container */}
                    <div className="md:w-64 bg-[#0000FF] rounded-lg flex flex-col">
                        {/* Sidebar for desktop */}
                        <div className="hidden md:flex flex-col space-y-2 p-4 flex-grow">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`flex items-center p-3 rounded-lg transition-colors ${
                                        activeTab === tab.id
                                            ? "bg-[#D93025] text-white"
                                            : "hover:bg-[#2a2a2a]"
                                    }`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <tab.icon className="mr-3" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        {/* Tabs for mobile */}
                        <div className="flex md:hidden scrollbar-hide overflow-x-auto space-x-2 p-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`flex items-center p-2 rounded-lg transition-colors whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? "bg-[#D93025] text-white"
                                            : "bg-[#2a2a2a]"
                                    }`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <tab.icon className="mr-2" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content container */}
                    <div className="flex-1 bg-[#212121] p-4 rounded-lg h-fit scrollbar-hide">
                        <TabContent
                            setCocktails={setCocktailsData}
                            cocktails={CocktailsData.cocktails}
                            fetchMore={getFeedPosts}
                            pages={CocktailsData.pages}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Home;
