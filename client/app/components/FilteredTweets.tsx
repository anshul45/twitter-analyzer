import { Flex, Space } from "antd"
import { FC } from "react"

interface FilteredTweetsProps {
  result:string[]
}
const FilteredTweets:FC<FilteredTweetsProps> = ({result}) => {
  return (
    result.length ? (
    <div className='border-[1px] rounded-md px-5 py-3'>
      <Space direction="vertical">
      {result?.map(result => 
      <div className="bg-white px-1.5 py-0.5 rounded-md">{result}</div>
    )}
    </Space>
    </div>
    ) :
    <Flex justify="center" align="center" className="h-full">
      <div className="bg-white text-2xl px-2.5 py-1.5 rounded-md text-center">Sorry no data...</div>
    </Flex>
  )
}

export default FilteredTweets