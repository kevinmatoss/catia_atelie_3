$().ready(function () {

	// Validação dos campos do formulário
	$("#form").validate({
		rules: {
			CNPJ_CPF: {
				cpfcnpj: brdocs.cpfcnpj.AMBOS
			}
		}
	});

	resetForm();

	$("#form").submit(e => {

		e.preventDefault();

		if (!$("#form").valid()) {
			return;
		}

		$('#submit').prop('disabled', true);
		sendRequest();
	});

	function resetForm() {
		$("#form .box-input").not(":first").hide();
		$("#form").each(function() {
			this.reset();
		});

		var qtdeImagens = $('.picture').length;
		for (var i = 1; i <= qtdeImagens; i++) {
			resetImages(i);
		}
		$(".picture__img").remove();
		$('#numero_pedido').prop('disabled', false);
		$('#numero_pedido').focus();
		$('#submit').html("Pesquisar");
		$('#submit').prop('disabled', false);
	}

	function resetImages(i) {
		const inputFile = document.querySelector("#picture-input-" + i);
		const pictureImage = document.querySelector("#picture-image-" + i);
		const pictureImageTxt = "Choose an image";
		pictureImage.innerHTML = pictureImageTxt;
		
		inputFile.addEventListener("change", function (e) {
		  const inputTarget = e.target;
		  const file = inputTarget.files[0];
		
			if (file) {
				const reader = new FileReader();
			
				reader.addEventListener("load", function (e) {
					const readerTarget = e.target;
				
					const img = document.createElement("img");
					const base64String = readerTarget.result;
					img.src = base64String;
					img.classList.add("picture__img");
				
					pictureImage.innerHTML = "";
					pictureImage.appendChild(img);

					base64String.replace('data:', '').replace(/^.+,/, '');

					$("#image" + i).val(base64String);
				});
				
				reader.readAsDataURL(file);
			} else {
				pictureImage.innerHTML = pictureImageTxt;
			}
		});
	}

	async function sendRequest() {
		const action = $('#row_id').val() ? "Edit" : "Find";
		if (action === "Find") {
			$('#submit').html("Localizando pedido...");
		} else {
			$('#submit').html("Enviando pedido...");
		}

		const json = mountJson(action);

		var response = await fetch('https://api.appsheet.com/api/v2/apps/e7e63295-0f90-40b4-bcfb-18177b8d3d18/tables/Pedidos/Action', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'ApplicationAccessKey': 'V2-frqfc-bdaua-E0GRB-o1ZKd-X8qoD-rX7Zd-qW5RJ-5OW4f'
			},
			body: json
		});

		showResponse(response, action);
	}

	function mountJson(action) {

		let properties = {};
		let rows = [];

		if (action === "Find") {
			properties = {
				"Selector": "Top(Filter(Pedidos, [Numero Pedido] = " + $('#numero_pedido').val() + "), 1)"
			};
		} else {
			const formData = new FormData($("#form")[0]);
			rows = [Object.fromEntries(formData)];
		}

		const json = {
			"Action": action,
			"Properties": properties,
			"Rows": rows
		}

		return JSON.stringify(json);
	}

	async function showResponse(response, action) {
		if (response.ok) {
			if (action === "Find") {
				var body = await response.json();
				var registro = body[0];
				if (registro) {
					$('#row_id').val(registro["Row ID"]);
					$('#numero_pedido').prop('disabled', true);
					$("#form .box-input").not(":first").show();
					$('#nome_completo').focus();
					$('#submit').html("Enviar pedido");
				} else {
					showMessage("Nenhum registro encontrado");
					$('#submit').html("Pesquisar");
				}
			} else {
				resetForm();
				showMessage("Pedido enviado com sucesso!");
			}
		} else {
			if (action === "Find") {
				showMessage("Pedido não localizado");
			} else {
				showMessage("Falha na requisição");
			}
		}
		$('#submit').prop('disabled', false);
	}

	function showMessage(message) {
		Swal.fire(message);
	}
});
