import DefaultService from "./default_service.js";
class CajaService extends DefaultService{
    constructor(){
        super();
        this.URL+="caja";
    }
}
export default CajaService;