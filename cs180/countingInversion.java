public class countingInversion {
	public static void main (String args[]) {
        Scanner s = new Scanner(System.in);
        System.out.println("Please input an array of integers, as 1,2,3,4,5: ");
        while(true) {
            String line = s.nextLine();
            if (line.equals("exit")) break;
            strArr = line.split(",");
            intArr = new int[strArr.length];
            for (int i = 0 ; i < strArr.length ; i++) {
                intArr[i] = Integer.parseInt(strArr[i]);
            }
            System.out,println("number of inversions is" + counting(intArr));
        }
	}
    
    public int counting(int[] array) {
        if (array.length = 0) return 0;
        return sort(array, 0, array.length - 1);
    }
    
    public int sort(int[] array, int start, int end) {
        int mid = start + (end - start)/2;
        int num = sort(array, start, mid);
        num += sort(array, mid+1, end);
        int i = start;
        int j = mid+1;
        int[] temp = new int[end - start + 1];
        while(i <= mid && j <= end) {
            if (array[i] < array[j]) {
                temp[i+j] = array[i];
                i++;
            }
            else if (array[i] == array[j]) {
                temp[i+j] = array[i];i++;
                temp[i+j] = array[j];j++;
            }
            else {
                temp[i+j] = array[j];j++;
                num += mid - i + 1;
            }
        }
        while (i <= mid) {
            array[i+j] = array[i];i++;
        }
        while (j <= end) {
            array[i+j] = array[j];j++;
        }
        return num;
    }
}