# Meu Ponto Mobile

Aplicativo em React Native (Expo) para quem anda de ônibus em São Paulo. Feito para a Global Solution 2026.2 de Cross-Platform Application Development (FIAP), usando a API Olho Vivo da SPTrans.

## O que o app faz

1. Pede permissão de localização e usa o **GPS** do celular para descobrir em qual rua você está.
2. Mostra os pontos de ônibus dessa rua, do mais perto para o mais longe, com a distância até cada um.
3. Ao tocar em um ponto, mostra os próximos ônibus com o tempo de chegada em minutos (atualiza a cada 30 segundos) e indica os veículos acessíveis.
4. Com o botão **Avisar**, o app dispara uma **notificação**, uma **vibração** e um alerta quando o ônibus escolhido estiver a 5 minutos do ponto.

Se o GPS for negado ou não achar pontos, dá para buscar pelo nome da rua (ex: Paulista). Se as notificações forem negadas, o app avisa só com alerta e vibração.

## Como funciona

A API Olho Vivo exige um token e um cookie de sessão. Para o token não ficar dentro do código do app, o celular chama um servidor intermediário publicado no Vercel (o mesmo do projeto web [meu-ponto](https://github.com/afroagg/meu-ponto)), e ele conversa com a SPTrans. O token fica só na variável de ambiente do Vercel.

A API não busca ponto por coordenada, só por texto. Por isso o app usa o GPS para descobrir o nome da rua, busca os pontos dessa rua e calcula a distância de cada um até você.

## Arquivos

- `App.js`: navegação entre as telas e configuração das notificações
- `screens/ListaScreen.js`: GPS, busca e lista de pontos
- `screens/DetalheScreen.js`: previsão de chegada e aviso
- `services/api.js`: chamadas à API
- `services/util.js`: distância, minutos e textos
- `components/Creditos.js`: crédito dos dados da SPTrans
- `cores.js`: cores do app
- `INTEGRANTES.txt`: integrantes e divisão do trabalho

## Como executar

1. Instale o **Expo Go** no celular (Play Store ou App Store).
2. No computador, com o Node instalado:

```
npm install
npx expo start
```

3. Leia o QR Code com o Expo Go (Android) ou com a câmera (iPhone). Celular e computador precisam estar na mesma rede Wi-Fi. Se não der, use `npx expo start --tunnel`.
4. Aceite a permissão de localização. Para testar o aviso, abra um ponto, toque em **Avisar** em uma linha e aceite a permissão de notificações. Se faltarem 5 minutos ou menos, o aviso dispara na hora.

O app precisa ficar aberto para receber o aviso.

## Créditos

Dados dos ônibus: SPTrans, API Olho Vivo (https://www.sptrans.com.br/desenvolvedores/).
