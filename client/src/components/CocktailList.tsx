import { useEffect, useState } from "react";
import CocktailDisplay from "./CocktailDisplay";
import { motion } from "framer-motion";
import Spinner from "./Spinner";
import { CocktailsData, ICocktail } from "../types/cocktail";

interface CocktailListProps {
    cocktails: ICocktail[];
    setCocktails: React.Dispatch<React.SetStateAction<CocktailsData>>;
    fetchMore: (page: number) => Promise<boolean>;
    pages: number;
}
const CocktailList = ({
    cocktails,
    fetchMore,
    pages,
    setCocktails,
}: CocktailListProps) => {
    const [page, setPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const getCocktails = async (page: number) => {
        setIsLoading(true);
        const result = await fetchMore(page);
        if (!result) {
            setPage((prevPage) => prevPage - 1);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (page === 1) return;
        if (page <= pages && !isLoading) {
            getCocktails(page);
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

    const likeUnlike = (cocktail: ICocktail) => {
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
                {cocktails.map((cocktail: ICocktail) => (
                    <div key={cocktail._id}>
                        <CocktailDisplay
                            likeUnlike={likeUnlike}
                            cocktail={cocktail}
                        />
                    </div>
                ))}
            </div>
            {isLoading && <Spinner />}
        </motion.div>
    );
};

export default CocktailList;
