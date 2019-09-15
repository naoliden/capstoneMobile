const jsPaypal = orderId => (
  `
    paypal.Buttons({

        style: {
          layout: 'horizontal',
          color: 'blue',
          shape: 'pill',
          label: 'paypal',
        },

        // Set up the transaction
        createOrder: function() {
            return '${orderId}'
        },

        // Finalize the transaction
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                if (details.error === 'INSTRUMENT_DECLINED') {
                  return actions.restart();
                }
                // Show a success message to the buyer
                alert('Transaction completed by ' + details.payer.name.given_name + '!');
                window.postMessage(JSON.stringify(details));
            });
        },

        // Handle cancelation
        onCancel: function(data) {
            window.postMessage(JSON.stringify({ cancel: true }));
        },

        // Handle errors
        onError: function(error) {
            window.postMessage(JSON.stringify({ cancel: true, error: error }));
        }
    }).render('#paypal-button-container');

    document.getElementById('go-back-button').addEventListener('click', () => {
      window.postMessage(JSON.stringify({ cancel: true }));
    });
  `
);

export default jsPaypal;
