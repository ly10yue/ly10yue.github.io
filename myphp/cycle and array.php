<?php
function extracted(int $n, array $arr)
{
    for ($i = 0; $i < $n; $i++) {
        for ($j = $n - 1; $j > $i; $j--) {
            if ($arr[$j] > $arr[$j - 1]) {
                list($arr[$j], $arr[$j - 1]) = [$arr[$j - 1], $arr[$j]];
            }
        }
    }
    print_r($arr);
}

?>
