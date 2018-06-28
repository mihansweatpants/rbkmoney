const altruist = 'ALTRUIST';
const cheater = 'CHEATER';
const cunning = 'CUNNING';
const unpredictable = 'UNPREDICTABLE';
const resentful = 'RESENTFUL';
const trickster = 'TRICKSTER';

// helper-functions
const shuffle = arr => {
    let counter = arr.length;

    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);

        counter--;

        let temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
};

const getRandomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

// Дальше будет дичь, но, если возьмете на стажировку, обещаю научиться и исправиться
class Merchant {
    constructor(charachter) {
        this.id = Merchant.generateId();
        this.charachter = charachter;
        this.originalCharachter = charachter;
        this.yearsLasted = 0;
        // данные для реализации поведения некоторых купцов, обнуляются к концу года
        this.state = {
            moneyMadeThisYear: 0,
            dealsMadeThisYear: 0,
            dealsResults: [],
            currentDeal: {
                move: null
            }
        };
    }

    static generateId() {
        return `_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
    }

    mistake() {
        const d = Math.random();
        if (d <= 0.95) {
            return false;
        } else {
            // 5% вероятность ошибиться
            return true;
        }
    }

    makeMove() {
        let move;

        switch (this.charachter) {
            case altruist:
                move = this.mistake() ? 'CHEAT' : 'FAIR';
                break;

            case cheater:
                move = this.mistake() ? 'FAIR' : 'CHEAT';
                break;

            case cunning:
                move = this.mistake() ? 'CHEAT' : 'FAIR';
                break;

            case unpredictable:
                if (Math.random() <= 0.5) {
                    move = this.mistake() ? 'CHEAT' : 'FAIR';
                } else {
                    move = this.mistake() ? 'FAIR' : 'CHEAT';
                }
                break;

            case resentful:
                if (
                    this.state.dealsResults.some(
                        deal => deal.gotCheatedOn === true
                    )
                ) {
                    move = this.mistake() ? 'FAIR' : 'CHEAT';
                } else move = this.mistake() ? 'CHEAT' : 'FAIR';
                break;

            case trickster:
                if (this.state.dealsMadeThisYear === 1) {
                    move = this.mistake() ? 'FAIR' : 'CHEAT';
                } else if (this.state.dealsMadeThisYear < 4) {
                    move = this.mistake() ? 'CHEAT' : 'FAIR';
                } else {
                    if (
                        this.state.dealsResults.every(
                            deal => deal.gotCheatedOn === false
                        )
                    ) {
                        this.charachter = cunning;
                        this.makeMove();
                    } else if (
                        this.state.dealsResults.some(
                            deal => deal.gotCheatedOn === true
                        )
                    ) {
                        this.charachter = cheater;
                        this.makeMove();
                    }
                }
                break;
        }

        this.state.currentDeal.move = move;
    }

    addMoney(amount) {
        this.state.moneyMadeThisYear += amount;
    }

    closeDeal(result) {
        this.state.dealsMadeThisYear++;
        this.state.dealsResults.push(result);
    }

    closeYear() {
        this.state.dealsResults = [];
        this.yearsLasted++;
    }
}

class Guild {
    constructor() {
        this.members = [];
    }

    populateGuild() {
        const members = this.members;
        if (members.length === 0) {
            this.addMerchant(10, altruist);
            this.addMerchant(10, cheater);
            this.addMerchant(10, cunning);
            this.addMerchant(10, unpredictable);
            this.addMerchant(10, resentful);
            this.addMerchant(10, trickster);
        }
        shuffle(members);
    }

    addMerchant(times, type) {
        for (let i = 0; i < times; i++) {
            this.members.push(new Merchant(type));
        }
    }

    purifyGuild() {
        // выявление и удаление 12 самых неуспешных купцов
        this.members.sort(
            (a, b) => a.state.moneyMadeThisYear - b.state.moneyMadeThisYear
        );
        this.members.splice(0, 12);
    }

    repopulateGuild() {
        // копирование и добавление 12 самых успешных купцов
        let bestMembers = this.members.slice(-12);
        bestMembers.forEach(merchant =>
            this.addMerchant(1, merchant.originalCharachter)
        );
        shuffle(this.members);
    }

    makeDealBetweenTwo(merchant, anotherMerchant, times) {
        // проверка на то чтобы сделка между двумя купцами заключалась
        // не более чем переданное в аргументах количество (5-10) раз
        let dealsMadeWithThisMerchant = 0;
        merchant.state.dealsResults.forEach(deal => {
            if (deal.opponentId === anotherMerchant.id)
                dealsMadeWithThisMerchant++;
        });

        if (
            merchant.id === anotherMerchant.id ||
            dealsMadeWithThisMerchant === times
        )
            return;

        anotherMerchant.makeMove();
        merchant.makeMove();

        let move = merchant.state.currentDeal.move;
        const anotherMove = anotherMerchant.state.currentDeal.move;

        if (
            merchant.charachter === cunning &&
            merchant.state.dealsMadeThisYear > 1
        ) {
            move = anotherMove;
        }

        if (move === 'FAIR' && anotherMove === 'FAIR') {
            merchant.addMoney(4);
            anotherMerchant.addMoney(4);
        } else if (move === 'CHEAT' && anotherMove === 'FAIR') {
            merchant.addMoney(5);
            anotherMerchant.addMoney(1);
        } else if (move === 'FAIR' && anotherMove === 'CHEAT') {
            merchant.addMoney(1);
            anotherMerchant.addMoney(5);
        } else if (move === 'CHEAT' && anotherMove === 'CHEAT') {
            merchant.addMoney(2);
            anotherMerchant.addMoney(2);
        }

        // что-то вроде истории сделок на данный год
        // хранится для реализации поведения некоторых купцов и удаляется к концу года
        const deal = Object.assign(
            {},
            {
                opponetId: anotherMerchant.id,
                cheated: move === 'FAIR' ? false : true,
                gotCheatedOn: anotherMove === 'FAIR' ? false : true
            }
        );

        const opponentsDeal = Object.assign(
            {},
            {
                opponentId: merchant.id,
                cheated: anotherMove === 'FAIR' ? false : true,
                gotCheatedOn: move === 'FAIR' ? false : true
            }
        );

        merchant.closeDeal(deal);
        anotherMerchant.closeDeal(opponentsDeal);
    }

    // симуляция одного года
    runYear() {
        let amountOfDeals = getRandomInt(5, 10);
        this.members.forEach(merchant => {
            merchant.state.moneyMadeThisYear = 0;
            merchant.state.dealsMadeThisYear = 0;
        });

        for (let i = 0; i < this.members.length; i++) {
            for (let k = 0; k < this.members.length; k++) {
                for (let a = 0; a < amountOfDeals; a++)
                    this.makeDealBetweenTwo(
                        this.members[i],
                        this.members[k],
                        amountOfDeals
                    );
            }
        }

        this.members.forEach(member => member.closeYear());
        this.purifyGuild();
        this.repopulateGuild();
    }
}

const dudes = new Guild();
dudes.populateGuild();

// для визуализации данных
const getResults = guild => {
    const resultData = [0, 0, 0, 0, 0, 0];
    guild.members.forEach(merchant => {
        if (merchant.originalCharachter === altruist) resultData[0]++;
        if (merchant.originalCharachter === cheater) resultData[1]++;
        if (merchant.originalCharachter === cunning) resultData[2]++;
        if (merchant.originalCharachter === unpredictable) resultData[3]++;
        if (merchant.originalCharachter === resentful) resultData[4]++;
        if (merchant.originalCharachter === trickster) resultData[5]++;
    });
    return resultData;
};

const runSimulation = time => {
    for (let i = 0; i < time; i++) {
        dudes.runYear();
    }
    return getResults(dudes);
};
