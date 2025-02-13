import { Flex } from 'antd';
import { Link } from '@remix-run/react';
import { useLocation } from "@remix-run/react";

const Navbar = () => {
  const location = useLocation();
  return (
    <Flex justify="space-between" align='center' className="bg-black text-white py-2.5 px-3">
      <div className="font-semibold text-2xl">Twitter Analysis</div>
      <Flex gap={20}>
        {/* Use Link for navigation */}
        <Link to="/" className={`cursor-pointer pb-1.5 text-white ${location.pathname === "/" ? "border-b-2" :""}`}>
          Home
        </Link>
        <Link to="/analysis" className={`cursor-pointer pb-1.5 text-white ${location.pathname === "/analysis" ? "border-b-2" :""}`}>
          Get Analysis
        </Link>
        <Link to="/summary" className={`cursor-pointer pb-1.5 text-white ${location.pathname === "/summary" ? "border-b-2" :""}`}>
          Summary
        </Link>
        <Link to="/users" className={`cursor-pointer pb-1.5 text-white ${location.pathname === "/users" ? "border-b-2" :""}`}>
          Users
        </Link>
      </Flex>
      <div></div>
    </Flex>
  );
};

export default Navbar;
