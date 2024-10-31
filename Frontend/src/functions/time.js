
export function convertToRelativeTime(isoString){   
    const isoPattern = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:?\d{2})?)/;
    
    const match = isoString.match(isoPattern);

    if (!match) {
        throw new Error('No valid ISO date found in string');
    }
    const cleanedStr = match[1];

    const dateobj = new Date(cleanedStr)
    

    if(isNaN(dateobj)){
        throw new Error(`Invalid date`)
    }

    const now = new Date();

    const timediff = now - dateobj;

    const seconddiff = Math.floor(timediff/1000)
    const minutediff = Math.floor(seconddiff/60)
    const hourdiff = Math.floor(minutediff/60)
    const daysdiff = Math.floor(hourdiff/24)

    if(daysdiff < 7){
        if(daysdiff == 0) return "Today";
        if(daysdiff == 1) return  "1 days ago"
        return `${daysdiff} days ago`
    }else{
        const options = {
            year : "numeric" , 
            month: "long",
            day : "numeric"
        };
        return dateobj.toLocaleString("en-US",options)
    }
}
