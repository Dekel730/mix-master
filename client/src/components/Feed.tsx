import { useEffect, useState } from "react";
import CocktailDisplay from "./CocktailDisplay"; // קומפוננטה להציג את הקוקטייל
import { motion } from "framer-motion";
import Spinner from "./Spinner";
import { CocktailsData, ICocktail } from "../types/cocktail"; // שים לב להתאמת סוגי הנתונים

interface FeedProps {
    cocktails: ICocktail[];
    setCocktails: React.Dispatch<React.SetStateAction<CocktailsData>>; // שינוי לשם המידע שלך
    fetchMore: (page: number) => Promise<boolean>;
    pages: number;
}

const Feed = ({
    cocktails,
    fetchMore,
    pages,
    setCocktails,
}: FeedProps) => {
    const [page, setPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const getCocktails = async (page: number) => {
        setIsLoading(true);
        const result = await fetchMore(page); // מבקש יותר קוקטיילים
        if (!result) {
            setPage((prevPage) => prevPage - 1);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (page === 1) return;
        if (page <= pages && !isLoading) {
            getCocktails(page); // שימוש בפונקציה המתאימה לקוקטיילים
        }
    }, [page]);

    const handleScroll = () => {
        if (
            window.innerHeight + document.documentElement.scrollTop >=
            document.documentElement.offsetHeight - 100
        ) {
            if (isLoading) return;
            setPage((prevPage) => prevPage + 1);
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const likeUnlike = (cocktail: ICocktail) => { // שינויים לשימוש עם קוקטיילים במקום פוסטים
        setCocktails((prevCocktails: CocktailsData) => ({
            ...prevCocktails,
            cocktails: prevCocktails.cocktails.map((prevCocktail: ICocktail) =>
                prevCocktail._id === cocktail._id ? cocktail : prevCocktail
            ),
        }));
    };

    return (
        <motion.div
            initial={{ y: "100vw", opacity: 0 }}
            animate={{ y: -10, opacity: 1 }}
            transition={{
                type: "spring",
                stiffness: 50,
                damping: 20,
            }}
            className="md:col-span-2"
        >
            <div className="grid gap-4">
                {cocktails.map((cocktail: ICocktail) => ( // שינוי מ-post ל-cocktail
                    <div key={cocktail._id}>
                        <CocktailDisplay
                            likeUnlike={likeUnlike}
                            cocktail={cocktail} // העברת קוקטייל
                        />
                    </div>
                ))}
            </div>
            {isLoading && <Spinner />}
        </motion.div>
    );
};

export default Feed;
