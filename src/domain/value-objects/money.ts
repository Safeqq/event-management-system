// Value Object Money - Merepresentasikan nilai uang dengan currency
//
// Properties:
// - amount: jumlah uang (number)
// - currency: kode mata uang (default: "IDR")
//
// Business rules:
// - Amount tidak boleh negatif
// - Operasi add/multiply hanya bisa dilakukan dengan currency yang sama
//
// Methods:
// - add(other: Money): Money - menambahkan dua nilai uang
// - multiply(factor: number): Money - mengalikan dengan faktor
// - equals(other: Money): boolean - membandingkan dua nilai uang
