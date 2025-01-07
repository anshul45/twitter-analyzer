import { Flex } from 'antd'
import React from 'react'

const Empty = () => {
  return (
    <Flex justify='center' align='center' className='w-full h-[calc(100vh-104px)] bg-gray-50 rounded-md'>
        <div className='text-3xl'>Sorry no data to show...</div>
    </Flex>
  )
}

export default Empty