import { Flex } from 'antd';
import { Link } from '@remix-run/react';

const Navbar = () => {
  return (
    <Flex justify="space-between" className="bg-black text-white py-3 px-3">
      <div className="font-semibold text-2xl">Twitter Analysis</div>
      <Flex gap={20}>
        {/* Use Link for navigation */}
        <Link to="/" className="cursor-pointer text-white">
          Home
        </Link>
        <Link to="/filterdata" className="cursor-pointer text-white">
          Generate Report
        </Link>
        <Link to="/analysis" className="cursor-pointer text-white">
          Get Analysis
        </Link>
        <Link to="/insight" className="cursor-pointer text-white">
          Get Insights
        </Link>
      </Flex>
      <div></div>
    </Flex>
  );
};

export default Navbar;
