import * as chai from "../lib/chai/index.js";
import CajaService from "../../../src/js/control/caja_service.js";
import sinon from "../lib/sinon/sinon-esm.js";
mocha.setup("tdd");
var stubFetch=sinon.stub(window,'fetch').resolve(new Response(JSON.stringify()))