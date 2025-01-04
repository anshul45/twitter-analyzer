import { Flex, Typography } from 'antd'
import React from 'react'

const Header = () => {
  return (
    <Flex className='px-10 py-3' justify='space-between' align='center'>
    <h1 className='font-semibold cursor-pointer'>Twitter Scrapper</h1>
    <h1 className='font-semibold cursor-pointer'>Home</h1>
    <h1></h1>
    </Flex>
  )
}

export default Header