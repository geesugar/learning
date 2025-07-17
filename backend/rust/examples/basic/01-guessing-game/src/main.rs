use std::cmp::Ordering;
use std::io;
use rand::Rng;

fn main() {
    println!(\"猜数字游戏！\");
    println!(\"我想了一个 1 到 100 之间的数字，你能猜到吗？\");

    let secret_number = rand::thread_rng().gen_range(1..=100);
    let mut attempts = 0;

    loop {
        println!(\"请输入你的猜测:\");

        let mut guess = String::new();
        io::stdin()
            .read_line(&mut guess)
            .expect(\"读取输入失败\");

        let guess: u32 = match guess.trim().parse() {
            Ok(num) => {
                if num < 1 || num > 100 {
                    println!(\"请输入 1 到 100 之间的数字！\");
                    continue;
                }
                num
            }
            Err(_) => {
                println!(\"请输入一个有效的数字！\");
                continue;
            }
        };

        attempts += 1;
        println!(\"你猜测的数字是: {}\", guess);

        match guess.cmp(&secret_number) {
            Ordering::Less => {
                println!(\"太小了！\");
                give_hint(guess, secret_number, attempts);
            }
            Ordering::Greater => {
                println!(\"太大了！\");
                give_hint(guess, secret_number, attempts);
            }
            Ordering::Equal => {
                println!(\"🎉 恭喜你！你猜对了！\");
                println!(\"你用了 {} 次尝试\", attempts);
                
                let rating = match attempts {
                    1 => \"不可思议！\",
                    2..=3 => \"太厉害了！\",
                    4..=6 => \"很不错！\",
                    7..=10 => \"还可以\",
                    _ => \"需要多练习哦\"
                };
                
                println!(\"评价: {}\", rating);
                break;
            }
        }
    }
}

fn give_hint(guess: u32, secret: u32, attempts: u32) {
    let diff = if guess > secret { 
        guess - secret 
    } else { 
        secret - guess 
    };
    
    match diff {
        1..=5 => println!(\"💡 提示：非常接近了！\"),
        6..=10 => println!(\"💡 提示：很接近了！\"),
        11..=20 => println!(\"💡 提示：比较接近\"),
        _ => println!(\"💡 提示：还差得远呢\"),
    }
    
    // 在第5次尝试后给出额外提示
    if attempts >= 5 {
        if secret % 2 == 0 {
            println!(\"💡 额外提示：这个数字是偶数\");
        } else {
            println!(\"💡 额外提示：这个数字是奇数\");
        }
    }
    
    // 在第8次尝试后给出范围提示
    if attempts >= 8 {
        let range_start = (secret / 10) * 10;
        let range_end = range_start + 9;
        println!(\"💡 额外提示：数字在 {} 到 {} 之间\", range_start, range_end);
    }
}