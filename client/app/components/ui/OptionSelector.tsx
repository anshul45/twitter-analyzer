import { Flex } from "antd"
import { FC, useState } from "react"

interface OptionSelectorProps{
    options : string[]
    selectedOption : string
    setSelectedOption : React.Dispatch<React.SetStateAction<string>>

}

const OptionSelector:FC<OptionSelectorProps> = ({options,selectedOption,setSelectedOption}) => {
  return (
        <Flex gap={3} className='bg-gray-100 p-1 border-[1px] rounded-md'>
            {options?.map((option:string) => 
            <div key={option} className={`${selectedOption === option ? "bg-white" :""}  py-0.5 w-full text-center rounded-md cursor-pointer font-semibold`} onClick={() => setSelectedOption(option)}>{option}</div>
            )}
            
        </Flex>
      
  )
}

export default OptionSelector