import { Flex } from "antd"
import { FC } from "react"

interface ResearchReportProps {
  result:string
}
const ResearchReport : FC<ResearchReportProps>= ({result}) => {
  return (
    result.length ?
    <div className='border-[1px] rounded-md px-5 py-3 bg-white'>{result}</div>
    :
    <Flex justify="center" align="center" className="h-full">
    <div className="bg-white text-2xl px-2.5 py-1.5 rounded-md text-center">Sorry no data...</div>
  </Flex>
  )
}

export default ResearchReport