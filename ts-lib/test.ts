//import Graph = require("Graph");
import {Graph} from "./donut";
import DataAttribute = Graph.DataAttribute;
import DonutParams = Graph.DonutParams;
import Donut = Graph.Donut;


export class Test {
    constructor() {
        var argumentsFordonut = new DonutParams();
        argumentsFordonut.elementId = "graph";
        var dataArr:any[] = [];

        var data = new DataAttribute();
        data.value = 40;
        data.label = "foo";
        dataArr.push(data);

        var data2 = new DataAttribute();
        data2.value = 60;
        data2.label = "bar";
        dataArr.push(data2);

        argumentsFordonut.data = dataArr;
        var d = new Donut(argumentsFordonut);
    }
}
