export class DateUtil{
   static dateOutput = (dateStr:string):string => {
        const date = new Date(dateStr);  
        const formattedDate = date.toDateString(); 
        return formattedDate;
        }

    static getCurrentDate = () : string => {
      const data = new Date();
      const formattedDate = data.toDateString();
      return formattedDate;
    }

    static getDatesForLastThreeDays = () => {
        const today = new Date();
        const formatDate = (date: Date) => {
          return date.toDateString();
        };
      
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        
        const dayBeforeYesterday = new Date(today);
        dayBeforeYesterday.setDate(today.getDate() - 2);
      
        return [
          formatDate(today),
          formatDate(yesterday),
          formatDate(dayBeforeYesterday),
        ];
      };
}