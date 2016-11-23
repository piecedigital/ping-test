var ajax = function(optionsObj) {
	optionsObj = optionsObj || {};
	// console.log(optionsObj.data);

	var httpRequest = new XMLHttpRequest();
	if(typeof optionsObj.upload === "function") httpRequest.upload.addEventListener("progress", optionsObj.upload, false);
	httpRequest.onreadystatechange = function(data) {
		if(httpRequest.readyState === 4) {
			if(httpRequest.status < 400) {
				if(typeof optionsObj.success === "function") {
					optionsObj.success(data.target.response);
				} else {
					console.log("no success callback in ajax object");
				}
			} else {
				if(typeof optionsObj.error === "function") {
					optionsObj.error({
						"status": data.target.status,
						"message": data.target.statusText,
						"response": data.target.response
					});
				} else {
					console.log("no error callback in ajax object. logging error below");
					console.error(data.target.status, data.target.statusText);
				}
			}
		}
	};
	var contentTypes = {
		jsonp: "application/javascript; charset=UTF-8",
		json: "application/json; charset=UTF-8",
		text: "text/plain; charset=UTF-8",
		formdata: "multipart/form-data; boundary=---------------------------file0123456789end"
	};

	httpRequest.open(((optionsObj.type || "").toUpperCase() || "GET"), optionsObj.url, optionsObj.multipart || true);
	if(optionsObj.dataType) httpRequest.setRequestHeader("Content-Type", `${contentTypes[(optionsObj.dataType.toLowerCase() || "text")]}`);
	if(typeof optionsObj.beforeSend == "function") {
		optionsObj.beforeSend(httpRequest);
	}
	httpRequest.send(optionsObj.data || null);
};

var Form = React.createClass({
  displayName: "Form",
  getInitialState: function () {
    return {
      allowPing: true,
      pingInterval: 100,
      sendData: false,
      pingData: "",
      pingMSValues: [],
      maxPing: 0,
      display: {
        boxHeight: 100,
        boxWidth: 200,
        bandWidth: 1
      }
    }
  },
  setSendData: function() {
    this.setState({
      sendData: this.refs["data-option"].checked
    }, this.updateData);
  },
  updateData: function () {
    console.log("updating data");
    var sendData = this.refs["data-option"].checked;
    console.log(sendData);
    var dataAmount = sendData ? parseInt(this.refs["data-amount"].value) : 0;
    console.log(dataAmount);
    var data = sendData ? this.makeData(dataAmount) : null;
    this.setState({
      pingData: data
    });
  },
  makeData: function (bytes) {
    var multiplier = 1024;
    var KB = bytes * multiplier;
    console.log("KB", KB);
    var MB = KB * multiplier;
    console.log("MB", MB);
    var data = "";
    for(i = 0; i < MB; i++) data += "0";
    return data;
  },
  ping: function () {
    if(this.state.allowPing) {
      var startTime = new Date().getTime();
      this.state.pingData ? console.log("ping data?: ", this.state.pingData.length) : null;
      ajax({
        url: "/ping",
        data: this.refs["data-option"].checked ? this.state.pingData : null,
        success: function(data) {
          // console.log(data);
          var endTime = new Date().getTime();
          var newPings = JSON.parse(JSON.stringify(this.state.pingMSValues));
          newPings.push((endTime - startTime) / 1000);
          if(newPings.length > this.state.display.boxWidth / this.state.display.bandWidth) newPings.shift();
          var newMaxPing = Math.max.apply(null, newPings);
          this.setState({
            pingMSValues: newPings,
            maxPing: newMaxPing > this.state.maxPing ? newMaxPing : this.state.maxPing
          });
          setTimeout(this.ping, this.refs["ping-interval"].value);
        }.bind(this),
        error: function(data) {
          var newPings = JSON.parse(JSON.stringify(this.state.pingMSValues));
          newPings.push(null);
          this.setState({
            pingMSValues: newPings
          });
          setTimeout(this.ping, this.refs["ping-interval"].value);
        }.bind(this)
      });
    }
  },
  startPing: function() {
    // console.log(this.refs);
    var sendData = this.refs["data-option"].checked;
    console.log(sendData);
    var dataAmount = sendData ? parseInt(this.refs["data-amount"].value) : 0;
    console.log(dataAmount);
    var data = sendData ? this.makeData(dataAmount) : null;
    this.setState({
      pinging: true,
      allowPing: true,
      pingData: data
    }, function () {
      this.ping();
    });
  },
  stopPing: function () {
    this.setState({
      pinging: false,
      allowPing: false
    });
  },
  resetData() {
    this.setState({
      pingMSValues: [],
      maxPing: 0
    });
  },
  render() {
    return (
      React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            null,
            "Send Data?: "
          ),
          React.createElement(
            "input",
            {ref: "data-option", type: "checkbox", onChange: this.setSendData}
          )
        ),
        this.state.sendData ? React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            null,
            "Data Amount: "
          ),
          React.createElement(
            "input",
            {ref: "data-amount", type: "number", min: 1, max: 25, defaultValue: 1, onChange: this.updateData}
          )
        ) : null,
        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            null,
            "Ping Interval: "
          ),
          React.createElement(
            "input",
            {ref: "ping-interval", type: "number", min: 1, defaultValue: 1}
          )
        ),
        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            null,
            ""
          ),
          React.createElement(
            "input",
            {type: "submit", defaultValue: this.state.pinging ? "Stop Pinging" : "Start Pinging", onClick: this.state.pinging ? this.stopPing : this.startPing }
          ),
          React.createElement(
            "input",
            {type: "submit", defaultValue: "Reset Data", onClick: this.resetData }
          )
        ),
        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            null,
            "Max Ping: "
          ),
          React.createElement(
            "span",
            null,
            this.state.maxPing + "s"
          )
        ),
        React.createElement(
          "div",
          {className: "data-box", style: {
            height: this.state.display.boxHeight + "px",
            width: this.state.display.boxWidth + "px"
          }},
          this.state.pingMSValues.map(function (val, ind) {
            return React.createElement(
              "div",
              {key: ind, style: {
                height: val ? this.state.display.boxHeight * (val / this.state.maxPing) + "px" : null,
                width: this.state.display.bandWidth
              }, className: "data-band" + (!val ? " bad" : ""), "data-val": val}
            )
          }.bind(this))
        )
      )
    );
  }
});

ReactDOM.render(React.createElement(Form), document.querySelector(".react"));
