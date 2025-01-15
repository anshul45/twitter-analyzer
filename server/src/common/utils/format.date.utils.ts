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

   static getDatesForLastSevenDays = (): string[] => {
     const today = new Date();
     const formatDate = (date: Date) => date.toDateString();
   
     // Generate the last seven days dynamically
     const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
       const date = new Date(today);
       date.setDate(today.getDate() - index);
       return formatDate(date);
     });
   
     return lastSevenDays;
   };
}