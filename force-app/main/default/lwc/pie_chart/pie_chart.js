/**
 * @author : Siddharth Patni
 * @description : this will make pie chart for Aggregated query
 */
 import { LightningElement, wire , track,api } from 'lwc';
 import makeAggregateQuery from '@salesforce/apex/LogData.makeAggregateQuery';
 import makeAggregateQuery1 from '@salesforce/apex/LogData.makeAggregateQuery1';
 
 import ChartJs from '@salesforce/resourceUrl/ChartJs';
 import { loadScript } from 'lightning/platformResourceLoader';
 import { ShowToastEvent } from 'lightning/platformShowToastEvent';
 
 export default class Gen_Pie_Chart extends LightningElement {
     chartConfiguration;
     @api field;
     @api query;
     hasData=false;
     
     connectedCallback(){
         this.loadData();
     }
     @api
     loadData(){
        makeAggregateQuery({query:this.query,field:this.field})
            .then(data => {
                console.log("in load data promise",data);
                this.loadHelper(data,null);
            })
            .catch(error => {
                this.loadHelper(null,error);

                this.dispatchEvent(new ShowToastEvent({
                    title: 'error while loading this component',
                    message: error+"",
                    variant: 'error',
                }));
            });
     }
     loadHelper(data,error){
        try{
            if(error){
                console.log(error);
                return;
            }
            console.log(this.query+"----- : ---------"+this.field);

            
                        let chartAmtData = [];
                        let chartLabel = [];
                        if(data){
                            data.forEach(obj => {
                                chartAmtData.push(obj.totalTime);
                                console.log(obj.totalTime+" : "+obj.field);
                                chartLabel.push(obj.field);
                            });
                        } else{
                            console.log(this.query+"- : -"+this.field);
                        }
                        this.chartConfiguration = {
                            type: 'doughnut',
                            data: {
                                datasets: [
                                    {
                                        label: this.field,
                                        backgroundColor:  [
                                            "#CDA776",
                                            "#989898",
                                            "#CB252B",
                                            "#E39371",
                                            "#1D7A46",
        
                                            "#D3212D",
                                            "#FFBF00",
                                            "#3DDC84",
                                            "#8DB600",
                                            "#008000",
        
                                            "#A1CAF1",
                                            "#F4C2C2",
                                            "#9F8170",
                                            "#FFE4C4",
                                            "#660000",
                                        ],
                                        data: chartAmtData,
                                    },
                                ],
                                labels: chartLabel,
                            },
                            options: {},
                        };
                        this.error = undefined;
                        this.promiseMaker();
                    
                
            
        } catch (error) {
            this.chartConfiguration = undefined;

            this.dispatchEvent(new ShowToastEvent({
                title: 'Some Problem Occured , Please Try Again.',
                message: error+"",
                variant: 'error',
            }));    
            console.log(error);        
        }
     }
     @wire(makeAggregateQuery1, { query: '$query' ,field : '$field' })
     makeAggregateQuery({ error, data }) {
        this.loadHelper(data,error);
     }
     //@description adds chart to canvas 
     promiseMaker(){
         try {
             Promise.all([loadScript(this, ChartJs)])
             .then(() => {
                 this.isChartJsInitialized = true;
                 const ctx = this.template.querySelector('canvas.pieChart').getContext('2d');
                 if(this.chart){
                    this.chart.destroy();
                }
                 this.chart = new window.Chart(ctx, JSON.parse(JSON.stringify(this.chartConfiguration)));
             })
             .catch(error => {
                 this.dispatchEvent(
                     new ShowToastEvent({ 
                         title: 'Error loading Chart',
                         message: error.message,
                         variant: 'error',
                     })
                 );
             });
         } catch (error) {
             this.dispatchEvent(new ShowToastEvent({
                 title: 'Some Problem Occured , Please Try Again.',
                 message: error,
                 variant: 'error',
             }));            
         }
     }
 }