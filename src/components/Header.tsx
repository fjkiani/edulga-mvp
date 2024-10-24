import React from "react";
import Image from "next/image";
import IconEdulga from "@/assets/IconEdulga";

interface Props {
    className?: string;
}

const Header = ({ className }: Props) => {

    return <div className="fixed h-[100px] top-0 w-screen bg-gray-300 backdrop-blur-lg shadow-lg">
        <IconEdulga className="h-[88px]" />
    </div>;
}

export default Header;