import React from "react";
import dulgaLogo from "./dulgaLogo.svg";
import Image from "next/image";

interface Props {
    className?: string;
}

const IconEdulga = ({ className }: Props) => {
    return <Image src={dulgaLogo} alt="Edulga" className={className} />;
}

export default IconEdulga;