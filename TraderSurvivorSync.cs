#region Using declarations
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using NinjaTrader.Cbi;
using NinjaTrader.NinjaScript;
#endregion

namespace NinjaTrader.NinjaScript.AddOns
{
    public class TraderSurvivorSync : AddOnBase
    {
        private Account myAccount;
        private static readonly HttpClient httpClient = new HttpClient();
        private const string WEBHOOK_URL = "http://localhost:8003/api/ninjatrader/execution";
        
        protected override void OnStateChange()
        {
            if (State == State.SetDefaults)
            {
                Name = "Trader Survivor Sync";
                Description = "Envía trades automáticamente a Trader Survivor";
            }
            else if (State == State.Realtime)
            {
                if (Account.All.Count > 0)
                {
                    myAccount = Account.All[0];
                    myAccount.ExecutionUpdate += OnExecutionUpdate;
                    Print("Trader Survivor Sync activado para cuenta: " + myAccount.Name);
                }
            }
            else if (State == State.Terminated)
            {
                if (myAccount != null)
                {
                    myAccount.ExecutionUpdate -= OnExecutionUpdate;
                }
            }
        }

        private void OnExecutionUpdate(object sender, ExecutionEventArgs e)
        {
            try
            {
                if (e.Execution.Order.OrderState != OrderState.Filled)
                    return;

                string action = e.Execution.Order.OrderAction.ToString();
                int quantity = e.Execution.Quantity;
                string symbol = e.Execution.Instrument.MasterInstrument.Name;
                double price = e.Execution.Price;
                
                Task.Run(() => SendToTraderSurvivor(
                    myAccount.Name,
                    e.Execution.Instrument.FullName,
                    symbol,
                    action,
                    quantity,
                    price,
                    e.Execution.Time.ToString("yyyy-MM-dd HH:mm:ss"),
                    e.Execution.Order.Id,
                    e.Execution.ExecutionId,
                    e.Execution.Commission,
                    e.Execution.MarketPosition.ToString()
                ));

                Print(string.Format("Trade enviado: {0} {1} {2} @ {3}", action, quantity, symbol, price));
            }
            catch (Exception ex)
            {
                Print("Error enviando trade: " + ex.Message);
            }
        }

        private async Task SendToTraderSurvivor(string account, string instrument, string symbol, 
            string action, int quantity, double price, string time, string orderId, 
            string executionId, double commission, string marketPosition)
        {
            try
            {
                string json = string.Format(
                    "{{\"account\":\"{0}\",\"instrument\":\"{1}\",\"symbol\":\"{2}\",\"action\":\"{3}\"," +
                    "\"quantity\":{4},\"price\":{5},\"time\":\"{6}\",\"orderId\":\"{7}\"," +
                    "\"executionId\":\"{8}\",\"commission\":{9},\"marketPosition\":\"{10}\"}}",
                    account, instrument, symbol, action, quantity, price, time, 
                    orderId, executionId, commission, marketPosition
                );
                
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await httpClient.PostAsync(WEBHOOK_URL, content);
                
                if (response.IsSuccessStatusCode)
                {
                    Print("Trade sincronizado exitosamente");
                }
                else
                {
                    Print("Error al sincronizar: " + response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                Print("Error HTTP: " + ex.Message);
            }
        }
    }
}
