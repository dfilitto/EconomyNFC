

const scriptsInEvents = {

	async Nfc_api_global_Event1_Act1(runtime, localVars)
	{
		try {
		  // Sinaliza que o sensor ligou e está aguardando
		  runtime.globalVars.Status_NFC = "Lendo";
		  
		  const ndef = new NDEFReader();
		  await ndef.scan();
		  
		  ndef.addEventListener("reading", ({ message }) => {
		    let textoLido = "";
		    for (const record of message.records) {
		      if (record.recordType === "text") {
		        const decoder = new TextDecoder(record.encoding);
		        textoLido = decoder.decode(record.data);
		      }
		    }
		    
		    try {
		      const dados = JSON.parse(textoLido);
		      
		      // A MÁGICA: O código verifica qual dado existe dentro do JSON
		      if (dados.saldo_debito !== undefined) {
		        
		        // É UM CARTÃO DE BANCO! Preenche as variáveis globais do cartão
		        runtime.globalVars.Cartao_Nome = dados.nome;
		        runtime.globalVars.Cartao_SaldoDebito = dados.saldo_debito;
		        runtime.globalVars.Cartao_LimiteCredito = dados.limite_credito;
		        runtime.globalVars.Cartao_FaturaAtual = dados.fatura_atual;
		        
		        runtime.globalVars.Status_NFC = "Sucesso_Cartao";
		        
		      } else if (dados.dias_para_vencer !== undefined) {
		        
		        // É UM PRODUTO! Preenche as variáveis globais do mercado
		        runtime.globalVars.Prod_Nome = dados.nome;
		        runtime.globalVars.Prod_Valor = dados.valor;
		        runtime.globalVars.Prod_DiasVencer = dados.dias_para_vencer;
		        
		        runtime.globalVars.Status_NFC = "Sucesso_Produto";
		        
		      } else {
		        // Tag lida, mas não pertence ao nosso ecossistema
		        runtime.globalVars.Status_NFC = "Erro";
		        runtime.globalVars.Mensagem_Erro_NFC = "Tag não reconhecida no sistema.";
		      }
		      
		    } catch (e) {
		      runtime.globalVars.Status_NFC = "Erro";
		      runtime.globalVars.Mensagem_Erro_NFC = "A tag está vazia ou corrompida.";
		    }
		  });
		
		} catch (error) {
		  runtime.globalVars.Status_NFC = "Erro";
		  runtime.globalVars.Mensagem_Erro_NFC = "Erro no sensor: " + error.message;
		}
	},

	async Nfc_api_global_Event2_Act1(runtime, localVars)
	{
		try {
		  runtime.globalVars.Status_NFC = "Lendo";
		  const ndef = new NDEFReader();
		  
		  // CORREÇÃO: "localVars" direto, sem o "runtime."
		  const dadosDoCartao = {
		    nome: localVars.Nome,
		    saldo_debito: localVars.Debito,
		    limite_credito: localVars.Limite,
		    fatura_atual: localVars.Fatura
		  };
		
		  await ndef.write(JSON.stringify(dadosDoCartao));
		  
		  runtime.globalVars.Status_NFC = "Sucesso_Gravar";
		
		} catch (error) {
		  runtime.globalVars.Status_NFC = "Erro";
		  runtime.globalVars.Mensagem_Erro_NFC = "Falha ao gravar cartão: " + error.message;
		}
	},

	async Nfc_api_global_Event3_Act1(runtime, localVars)
	{
		try {
		  runtime.globalVars.Status_NFC = "Lendo";
		  const ndef = new NDEFReader();
		  
		  // CORREÇÃO: "localVars" direto, sem o "runtime."
		  const dadosDoProduto = {
		    nome: localVars.Nome,
		    valor: localVars.Valor,
		    dias_para_vencer: localVars.DiasVencer
		  };
		
		  await ndef.write(JSON.stringify(dadosDoProduto));
		  
		  runtime.globalVars.Status_NFC = "Sucesso_Gravar";
		
		} catch (error) {
		  runtime.globalVars.Status_NFC = "Erro";
		  runtime.globalVars.Mensagem_Erro_NFC = "Falha ao gravar produto: " + error.message;
		}
	}
};

globalThis.C3.JavaScriptInEvents = scriptsInEvents;
