export default class SearchQuery {
    constructor(queryString) {
        let query_fields = queryString.split(" ")

        for (let field of query_fields) {
            if (field.indexOf(':') === -1){
                this.valid = false
                return
            }

            let type = field.substring(0, field.indexOf(':'))
            let value = field.substring(field.indexOf(':')+1)
            console.log(`query type: ${type} \nfor value ${value}`)

            switch(type) {
                case "drive": this.drive = value
                break

                case "owner": this.owner = value
                break

                case "creator": this.creator = value
                break

                case "from": this.from = value
                break

                case "to": this.to = value
                break

                case "readable": this.readable = value
                break

                case "writable": this.writable = value
                break

                case "shareable": this.shareable = value
                break

                case "name": this.name = value
                break

                case "inFolder": this.inFolder = value
                break

                case "folder": this.folder = value
                break

                case "path": this.path = value
                break

                case "sharing": this.sharing = value
                break

                default: {this.valid = false; return}          
            }
        }
        this.valid = true
    }
}